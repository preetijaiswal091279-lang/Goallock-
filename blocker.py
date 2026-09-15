import time
import ctypes
import threading
import subprocess
import platform

import psutil


class GoalLockBlocker:

    def __init__(self):
        self.active = False
        self.selected_distractions = []
        self.thread = None

        # Windows hosts file
        self.hosts_file = r"C:\Windows\System32\drivers\etc\hosts"

        self.marker_start = "# GOALLOCK START"
        self.marker_end = "# GOALLOCK END"

        # Desktop application process names
        self.app_processes = {
            "Instagram": [
                "Instagram.exe"
            ],
            "YouTube": [],
            "Facebook": [],
            "TikTok": []
        }

        # Default websites
        self.website_domains = {
            "Instagram": [
                "instagram.com",
                "www.instagram.com"
            ],
            "YouTube": [
                "youtube.com",
                "www.youtube.com",
                "m.youtube.com",
                "youtu.be"
            ],
            "Facebook": [
                "facebook.com",
                "www.facebook.com",
                "m.facebook.com"
            ],
            "TikTok": [
                "tiktok.com",
                "www.tiktok.com"
            ]
        }

    # ---------------------------------------------------------
    # PLATFORM
    # ---------------------------------------------------------

    def is_windows(self):
        return platform.system().lower() == "windows"

    # ---------------------------------------------------------
    # ADMIN CHECK
    # ---------------------------------------------------------

    def is_admin(self):

        if not self.is_windows():
            return False

        try:
            return bool(
                ctypes.windll.shell32.IsUserAnAdmin()
            )

        except Exception:
            return False

    # ---------------------------------------------------------
    # START BLOCKER
    # ---------------------------------------------------------

    def start(self, distractions):

        if self.active:
            return {
                "success": False,
                "message": "GoalLock is already active."
            }

        if not distractions:
            return {
                "success": False,
                "message": "No distractions selected."
            }

        self.selected_distractions = distractions.copy()

        # -----------------------------------------------------
        # RENDER / LINUX SERVER
        # -----------------------------------------------------
        #
        # Render cannot modify the user's Windows computer.
        # Therefore the timer is allowed to start, but actual
        # Windows blocking is skipped on the server.
        #

        if not self.is_windows():

            self.active = True

            self.thread = threading.Thread(
                target=self.monitor_apps,
                daemon=True
            )

            self.thread.start()

            print("\nGOALLOCK TIMER ACTIVE - SERVER MODE")

            print("Selected distractions:")

            for item in self.selected_distractions:
                print("-", item)

            return {
                "success": True,
                "message": "Timer started successfully.",
                "server_mode": True,
                "blocking": False,
                "domains": self.get_domains_to_block()
            }

        # -----------------------------------------------------
        # WINDOWS
        # -----------------------------------------------------

        if not self.is_admin():

            self.selected_distractions = []

            return {
                "success": False,
                "message":
                    "Run VS Code or GoalLock as Administrator before starting a session."
            }

        # Block websites FIRST
        website_result = self.block_websites()

        if not website_result.get("success", False):

            self.selected_distractions = []

            return website_result

        # Only now activate blocker
        self.active = True

        self.thread = threading.Thread(
            target=self.monitor_apps,
            daemon=True
        )

        self.thread.start()

        print("\nGOALLOCK ACTIVE")
        print("Blocked items:")

        for item in self.selected_distractions:
            print("-", item)

        return {
            "success": True,
            "message": "Selected distractions are blocked.",
            "server_mode": False,
            "blocking": True,
            "domains": website_result.get("domains", [])
        }

    # ---------------------------------------------------------
    # STOP
    # ---------------------------------------------------------

    def stop(self):

        self.active = False

        # Only Windows can modify the hosts file
        if self.is_windows() and self.is_admin():
            self.unblock_websites()

        self.selected_distractions = []

        print(
            "GOALLOCK SESSION COMPLETED."
        )

    # ---------------------------------------------------------
    # MONITOR APPS
    # ---------------------------------------------------------

    def monitor_apps(self):

        # Render/Linux has no Windows apps to monitor
        if not self.is_windows():
            return

        while self.active:

            for distraction in self.selected_distractions:

                processes = self.app_processes.get(
                    distraction,
                    []
                )

                if not processes:
                    continue

                for process in psutil.process_iter(
                    [
                        "pid",
                        "name"
                    ]
                ):

                    try:

                        process_name = process.info["name"]

                        if process_name in processes:

                            subprocess.run(
                                [
                                    "taskkill",
                                    "/F",
                                    "/PID",
                                    str(
                                        process.info["pid"]
                                    )
                                ],
                                capture_output=True,
                                text=True
                            )

                    except psutil.NoSuchProcess:
                        pass

                    except psutil.AccessDenied:
                        pass

                    except Exception:
                        pass

            time.sleep(1)

    # ---------------------------------------------------------
    # NORMALIZE DOMAIN
    # ---------------------------------------------------------

    def normalize_domain(self, value):

        value = (
            str(value)
            .strip()
            .lower()
        )

        # Custom values may be stored with custom: prefix
        if value.startswith("custom:"):

            value = value.replace(
                "custom:",
                "",
                1
            )

        value = value.replace(
            "https://",
            ""
        )

        value = value.replace(
            "http://",
            ""
        )

        value = value.split("/")[0]
        value = value.split("?")[0]
        value = value.split("#")[0]

        # Remove port
        value = value.split(":")[0]

        return value.strip()

    # ---------------------------------------------------------
    # GET DOMAINS
    # ---------------------------------------------------------

    def get_domains_to_block(self):

        domains_to_block = []

        for distraction in self.selected_distractions:

            # Popular predefined distraction
            if distraction in self.website_domains:

                domains = self.website_domains[
                    distraction
                ]

                domains_to_block.extend(
                    domains
                )

            else:

                # Unknown value = custom website/domain
                domain = self.normalize_domain(
                    distraction
                )

                if domain:

                    domains_to_block.append(
                        domain
                    )

                    # Also block www version
                    if not domain.startswith("www."):

                        domains_to_block.append(
                            "www." + domain
                        )

        # Remove duplicates
        unique_domains = []

        for domain in domains_to_block:

            if domain not in unique_domains:

                unique_domains.append(
                    domain
                )

        return unique_domains

    # ---------------------------------------------------------
    # BLOCK WEBSITES
    # ---------------------------------------------------------

    def block_websites(self):

        # Website blocking only works on Windows
        if not self.is_windows():

            return {
                "success": True,
                "message":
                    "Website blocking skipped in server mode.",
                "domains":
                    self.get_domains_to_block()
            }

        if not self.is_admin():

            return {
                "success": False,
                "message":
                    "Administrator permission is required for website blocking."
            }

        domains_to_block = self.get_domains_to_block()

        try:

            # Remove old GoalLock entries first
            self.remove_goallock_hosts_entries()

            if domains_to_block:

                with open(
                    self.hosts_file,
                    "a",
                    encoding="utf-8"
                ) as file:

                    file.write("\n")

                    file.write(
                        self.marker_start + "\n"
                    )

                    for domain in domains_to_block:

                        file.write(
                            "127.0.0.1 "
                            + domain
                            + "\n"
                        )

                    file.write(
                        self.marker_end + "\n"
                    )

            self.flush_dns()

            print("\nGoalLock blocked domains:")

            for domain in domains_to_block:
                print(domain)

            return {
                "success": True,
                "message":
                    "Website blocking started successfully.",
                "domains":
                    domains_to_block
            }

        except PermissionError:

            return {
                "success": False,
                "message":
                    "Permission denied. Run VS Code as Administrator."
            }

        except Exception as error:

            print(
                "Website blocking error:",
                error
            )

            return {
                "success": False,
                "message":
                    "Website blocking failed: "
                    + str(error)
            }

    # ---------------------------------------------------------
    # UNBLOCK WEBSITES
    # ---------------------------------------------------------

    def unblock_websites(self):

        # Nothing to do on Render/Linux
        if not self.is_windows():
            return

        if not self.is_admin():
            return

        try:

            self.remove_goallock_hosts_entries()

            self.flush_dns()

        except Exception as error:

            print(
                "Website unblocking error:",
                error
            )

    # ---------------------------------------------------------
    # REMOVE GOALLOCK HOSTS ENTRIES
    # ---------------------------------------------------------

    def remove_goallock_hosts_entries(self):

        # Nothing to do on Render/Linux
        if not self.is_windows():
            return

        try:

            with open(
                self.hosts_file,
                "r",
                encoding="utf-8"
            ) as file:

                content = file.read()

            start = content.find(
                self.marker_start
            )

            end = content.find(
                self.marker_end
            )

            if (
                start != -1
                and
                end != -1
            ):

                end = (
                    end
                    +
                    len(self.marker_end)
                )

                new_content = (
                    content[:start]
                    +
                    content[end:]
                )

                with open(
                    self.hosts_file,
                    "w",
                    encoding="utf-8"
                ) as file:

                    file.write(
                        new_content
                    )

        except FileNotFoundError:
            pass

        except Exception as error:

            print(
                "Hosts cleanup error:",
                error
            )

    # ---------------------------------------------------------
    # FLUSH DNS
    # ---------------------------------------------------------

    def flush_dns(self):

        # Only Windows has ipconfig /flushdns
        if not self.is_windows():
            return

        try:

            subprocess.run(
                [
                    "ipconfig",
                    "/flushdns"
                ],
                capture_output=True,
                text=True
            )

        except Exception:
            pass