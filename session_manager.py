import time
import threading

from blocker import GoalLockBlocker


class SessionManager:


    def __init__(self):

        self.blocker = GoalLockBlocker()

        self.active = False

        self.start_time = None

        self.duration = 0

        self.end_time = None

        self.selected_distractions = []

        self.completed_sessions = 0

        self.total_focus_seconds = 0

        self.history = []

        self.timer_thread = None


    def start_session(
        self,
        minutes,
        distractions
    ):


        if self.active:

            return {
                "success": False,
                "message":
                    "A GoalLock session is already running."
            }


        try:

            minutes = float(
                minutes
            )


        except Exception:

            return {
                "success": False,
                "message":
                    "Invalid focus time."
            }


        if minutes <= 0:

            return {
                "success": False,
                "message":
                    "Focus time must be greater than zero."
            }


        if not distractions:

            return {
                "success": False,
                "message":
                    "Select at least one distraction first."
            }


        # IMPORTANT:
        # Blocking happens BEFORE
        # the session is marked active.

        block_result = self.blocker.start(
            distractions
        )


        if not block_result.get(
            "success",
            False
        ):

            return {
                "success": False,
                "message":
                    block_result.get(
                        "message",
                        "GoalLock could not block the selected distractions."
                    )
            }


        self.duration = int(
            minutes * 60
        )


        self.start_time = time.time()


        self.end_time = (
            self.start_time
            +
            self.duration
        )


        self.selected_distractions = (
            distractions.copy()
        )


        # Session becomes active ONLY
        # after blocking succeeds.

        self.active = True


        self.timer_thread = threading.Thread(
            target=self.watch_session,
            daemon=True
        )


        self.timer_thread.start()


        return {

            "success": True,

            "message":
                "GoalLock started successfully. "
                "Selected distractions are now blocked.",

            "blocked_items":
                self.selected_distractions

        }


    def watch_session(self):

        while self.active:


            if (
                time.time()
                >=
                self.end_time
            ):

                self.complete_session()

                break


            time.sleep(1)


    def complete_session(self):

        if not self.active:

            return


        completed_duration = (
            self.duration
        )


        completed_distractions = (
            self.selected_distractions.copy()
        )


        # Automatically unblock
        # when timer finishes.

        self.blocker.stop()


        self.completed_sessions += 1


        self.total_focus_seconds += (
            completed_duration
        )


        self.history.insert(

            0,

            {

                "duration":
                    completed_duration,

                "distractions":
                    completed_distractions,

                "completed":
                    True

            }

        )


        self.active = False

        self.start_time = None

        self.end_time = None

        self.duration = 0

        self.selected_distractions = []


    def get_status(self):

        remaining = 0


        if (
            self.active
            and
            self.end_time
        ):

            remaining = max(

                0,

                int(
                    self.end_time
                    -
                    time.time()
                )

            )


        return {

            "active":
                self.active,

            "remaining":
                remaining,

            "completed_sessions":
                self.completed_sessions,

            "total_focus_seconds":
                self.total_focus_seconds,

            "selected_distractions":
                self.selected_distractions

        }


    def get_progress(self):

        return {

            "completed_sessions":
                self.completed_sessions,

            "total_focus_seconds":
                self.total_focus_seconds

        }


    def get_history(self):

        return self.history