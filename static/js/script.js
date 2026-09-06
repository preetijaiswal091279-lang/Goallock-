/* =====================================
   GOALLOCK
   COMPLETE FRONTEND JAVASCRIPT
===================================== */


/* =====================================
   GENERAL HELPERS
===================================== */

function getSavedDistractions() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "goallockDistractions"
            )
        ) || [];

    }

    catch (error) {

        return [];

    }

}


function saveDistractions(
    distractions
) {

    localStorage.setItem(

        "goallockDistractions",

        JSON.stringify(
            distractions
        )

    );

}


function normalizeWebsite(
    value
) {

    let website = (
        value
        .trim()
        .toLowerCase()
    );


    website = website.replace(
        "https://",
        ""
    );


    website = website.replace(
        "http://",
        ""
    );


    website = website.split(
        "/"
    )[0];


    website = website.split(
        "?"
    )[0];


    website = website.split(
        "#"
    )[0];


    website = website.split(
        ":"
    )[0];


    return website;

}


function isValidDomain(
    domain
) {

    const pattern =
        /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;


    return pattern.test(
        domain
    );

}



/* =====================================
   BLOCK DISTRACTIONS PAGE
===================================== */

const distractionItems =
    document.querySelectorAll(
        ".distraction-item"
    );


const websiteInput =
    document.querySelector(
        ".website-url-input"
    );


const addWebsiteButton =
    document.querySelector(
        ".add-website-button"
    );


const customWebsitesContainer =
    document.querySelector(
        ".custom-websites-container"
    );


const websiteError =
    document.querySelector(
        ".website-error"
    );


const saveDistractionsButton =
    document.querySelector(
        ".save-distractions"
    );


const selectionMessage =
    document.querySelector(
        ".selection-message"
    );


let selectedDistractions =
    getSavedDistractions();



/* =====================================
   RENDER CUSTOM WEBSITES
===================================== */

function renderCustomWebsites() {


    if (
        !customWebsitesContainer
    ) {

        return;

    }


    const customWebsites =
        selectedDistractions.filter(

            function(item) {

                return ![
                    "Instagram",
                    "YouTube",
                    "Facebook",
                    "TikTok"
                ].includes(
                    item
                );

            }

        );


    customWebsitesContainer.innerHTML =
        "";


    if (
        customWebsites.length === 0
    ) {


        customWebsitesContainer.innerHTML =
            `
            <p class="no-custom-websites">
                No custom websites added yet.
            </p>
            `;


        return;

    }


    customWebsites.forEach(

        function(website) {


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "custom-website-item";


            item.innerHTML =
                `
                <span>
                    🌐 ${website}
                </span>

                <button
                    type="button"
                    class="remove-website"
                    data-website="${website}"
                >
                    ✕
                </button>
                `;


            customWebsitesContainer.appendChild(
                item
            );


        }

    );


    document
    .querySelectorAll(
        ".remove-website"
    )
    .forEach(

        function(button) {


            button.addEventListener(

                "click",

                function() {


                    const website =
                        button.dataset.website;


                    selectedDistractions =
                        selectedDistractions.filter(

                            function(item) {

                                return (
                                    item !== website
                                );

                            }

                        );


                    saveDistractions(
                        selectedDistractions
                    );


                    renderCustomWebsites();


                }

            );


        }

    );

}



/* =====================================
   RESTORE SELECTED POPULAR APPS
===================================== */

function restoreSelectedApps() {


    distractionItems.forEach(

        function(item) {


            const app =
                item.dataset.app;


            const small =
                item.querySelector(
                    "small"
                );


            if (
                selectedDistractions.includes(
                    app
                )
            ) {


                item.classList.add(
                    "selected"
                );


                if (small) {

                    small.textContent =
                        "Selected";

                }


            }

            else {


                item.classList.remove(
                    "selected"
                );


                if (small) {

                    small.textContent =
                        "Select";

                }


            }


        }

    );


}



/* =====================================
   SELECT POPULAR DISTRACTION
===================================== */

distractionItems.forEach(

    function(item) {


        item.addEventListener(

            "click",

            function() {


                const app =
                    item.dataset.app;


                const small =
                    item.querySelector(
                        "small"
                    );


                if (
                    selectedDistractions.includes(
                        app
                    )
                ) {


                    selectedDistractions =
                        selectedDistractions.filter(

                            function(value) {

                                return (
                                    value !== app
                                );

                            }

                        );


                    item.classList.remove(
                        "selected"
                    );


                    if (small) {

                        small.textContent =
                            "Select";

                    }


                }

                else {


                    selectedDistractions.push(
                        app
                    );


                    item.classList.add(
                        "selected"
                    );


                    if (small) {

                        small.textContent =
                            "Selected";

                    }


                }


            }

        );


    }

);



/* =====================================
   ADD CUSTOM WEBSITE
===================================== */

if (
    addWebsiteButton
) {


    addWebsiteButton.addEventListener(

        "click",

        function() {


            if (
                !websiteInput
            ) {

                return;

            }


            const rawValue =
                websiteInput.value;


            const website =
                normalizeWebsite(
                    rawValue
                );


            if (
                websiteError
            ) {

                websiteError.textContent =
                    "";

            }


            if (
                !website
            ) {


                if (
                    websiteError
                ) {

                    websiteError.textContent =
                        "Enter a website first.";

                }


                return;

            }


            if (
                !isValidDomain(
                    website
                )
            ) {


                if (
                    websiteError
                ) {

                    websiteError.textContent =
                        "Enter a valid domain such as netflix.com.";

                }


                return;

            }


            if (
                selectedDistractions.includes(
                    website
                )
            ) {


                if (
                    websiteError
                ) {

                    websiteError.textContent =
                        "This website is already added.";

                }


                return;

            }


            selectedDistractions.push(
                website
            );


            websiteInput.value =
                "";


            saveDistractions(
                selectedDistractions
            );


            renderCustomWebsites();


        }

    );


}



/* =====================================
   SAVE AND CONTINUE
===================================== */

if (
    saveDistractionsButton
) {


    saveDistractionsButton.addEventListener(

        "click",

        function() {


            if (
                selectedDistractions.length === 0
            ) {


                if (
                    selectionMessage
                ) {

                    selectionMessage.textContent =
                        "Select at least one distraction before continuing.";

                }


                return;

            }


            saveDistractions(
                selectedDistractions
            );


            if (
                selectionMessage
            ) {

                selectionMessage.textContent =
                    "Saved successfully. Returning to Home...";

            }


            setTimeout(

                function() {

                    window.location.href =
                        "/";

                },

                700

            );


        }

    );


}



/* =====================================
   INITIALIZE BLOCK PAGE
===================================== */

restoreSelectedApps();

renderCustomWebsites();



/* =====================================
   HOME PAGE TIMER
===================================== */

const timer =
    document.querySelector(
        ".timer"
    );


const timeButtons =
    document.querySelectorAll(
        ".time-button"
    );


const customButton =
    document.querySelector(
        ".custom-button"
    );


const customModal =
    document.querySelector(
        ".custom-modal"
    );


const customTimeInput =
    document.querySelector(
        ".custom-time-input"
    );


const setCustomTimeButton =
    document.querySelector(
        ".set-custom-time"
    );


const cancelCustomTimeButton =
    document.querySelector(
        ".cancel-custom-time"
    );


const startButton =
    document.querySelector(
        ".start-button"
    );


const sessionMessage =
    document.querySelector(
        ".session-message"
    );


const sessionStatus =
    document.querySelector(
        ".session-status"
    );


const todayFocus =
    document.querySelector(
        ".today-focus"
    );


const todaySessions =
    document.querySelector(
        ".today-sessions"
    );


let selectedMinutes = 45;

let sessionActive = false;



function formatTime(
    seconds
) {

    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (

        String(
            minutes
        ).padStart(
            2,
            "0"
        )

        +

        ":"

        +

        String(
            remainingSeconds
        ).padStart(
            2,
            "0"
        )

    );

}



/* =====================================
   SHOW BLOCKED ITEMS ON HOME
===================================== */

function showBlockedItems(
    items,
    active = false
) {


    let blockedList =
        document.querySelector(
            ".blocked-items-list"
        );


    if (
        !blockedList
    ) {

        return;

    }


    blockedList.innerHTML =
        "";


    if (
        !items
        ||
        items.length === 0
    ) {


        blockedList.innerHTML =
            `
            <p>
                No distractions selected yet.
                Go to Block Distractions first.
            </p>
            `;


        return;

    }


    items.forEach(

        function(item) {


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "blocked-item";


            const popularApps = [
                "Instagram",
                "YouTube",
                "Facebook",
                "TikTok"
            ];


            const icon =
                popularApps.includes(
                    item
                )
                    ? "📱"
                    : "🌐";


            const label =
                active
                    ? "BLOCKED"
                    : "READY TO BLOCK";


            element.innerHTML =
                `
                <span>
                    ${icon} ${item}
                </span>

                <small>
                    ${label}
                </small>
                `;


            blockedList.appendChild(
                element
            );


        }

    );

}



/* =====================================
   TIME BUTTONS
===================================== */

timeButtons.forEach(

    function(button) {


        button.addEventListener(

            "click",

            function() {


                if (
                    sessionActive
                ) {

                    return;

                }


                selectedMinutes =
                    Number(
                        button.dataset.time
                    );


                timeButtons.forEach(

                    function(item) {

                        item.classList.remove(
                            "selected"
                        );

                    }

                );


                button.classList.add(
                    "selected"
                );


                if (timer) {

                    timer.textContent =
                        formatTime(
                            selectedMinutes * 60
                        );

                }


            }

        );


    }

);



/* =====================================
   CUSTOM TIMER
===================================== */

if (
    customButton
) {


    customButton.addEventListener(

        "click",

        function() {


            if (
                sessionActive
            ) {

                return;

            }


            if (
                customModal
            ) {

                customModal.style.display =
                    "flex";

            }


        }

    );


}



if (
    setCustomTimeButton
) {


    setCustomTimeButton.addEventListener(

        "click",

        function() {


            const minutes =
                Number(
                    customTimeInput.value
                );


            if (
                minutes > 0
            ) {


                selectedMinutes =
                    minutes;


                if (
                    timer
                ) {

                    timer.textContent =
                        formatTime(
                            selectedMinutes * 60
                        );

                }


                customModal.style.display =
                    "none";


                customTimeInput.value =
                    "";


            }


        }

    );


}



if (
    cancelCustomTimeButton
) {


    cancelCustomTimeButton.addEventListener(

        "click",

        function() {


            customModal.style.display =
                "none";


            customTimeInput.value =
                "";


        }

    );


}



/* =====================================
   START SESSION
===================================== */

if (
    startButton
) {


    startButton.addEventListener(

        "click",

        async function() {


            if (
                sessionActive
            ) {

                return;

            }


            const distractions =
                getSavedDistractions();


            if (
                distractions.length === 0
            ) {


                if (
                    sessionMessage
                ) {

                    sessionMessage.textContent =
                        "Select what you want to block first.";

                }


                return;

            }


            startButton.disabled =
                true;


            startButton.textContent =
                "⏳ BLOCKING DISTRACTIONS...";


            try {


                const response =
                    await fetch(

                        "/api/start-session",

                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    {

                                        minutes:
                                            selectedMinutes,

                                        distractions:
                                            distractions

                                    }
                                )

                        }

                    );


                const result =
                    await response.json();


                if (
                    result.success
                ) {


                    sessionActive =
                        true;


                    startButton.textContent =
                        "🔒 GOALLOCK ACTIVE";


                    if (
                        sessionStatus
                    ) {

                        sessionStatus.textContent =
                            "🔒 GoalLock is active";

                    }


                    if (
                        sessionMessage
                    ) {

                        sessionMessage.textContent =
                            "Selected distractions are now blocked.";

                    }


                    showBlockedItems(
                        distractions,
                        true
                    );


                    timeButtons.forEach(

                        function(button) {

                            button.disabled =
                                true;

                        }

                    );


                    if (
                        customButton
                    ) {

                        customButton.disabled =
                            true;

                    }


                }

                else {


                    startButton.disabled =
                        false;


                    startButton.textContent =
                        "🔒 START GOALLOCK SESSION";


                    if (
                        sessionMessage
                    ) {

                        sessionMessage.textContent =
                            result.message;

                    }


                }


            }

            catch (error) {


                startButton.disabled =
                    false;


                startButton.textContent =
                    "🔒 START GOALLOCK SESSION";


                if (
                    sessionMessage
                ) {

                    sessionMessage.textContent =
                        "Could not connect to GoalLock backend.";

                }


            }


        }

    );


}



/* =====================================
   LIVE STATUS
===================================== */

async function updateStatus() {


    try {


        const response =
            await fetch(
                "/api/status"
            );


        const status =
            await response.json();


        if (
            status.active
        ) {


            sessionActive =
                true;


            if (
                timer
            ) {

                timer.textContent =
                    formatTime(
                        status.remaining
                    );

            }


            showBlockedItems(

                status.selected_distractions,

                true

            );


            if (
                startButton
            ) {

                startButton.disabled =
                    true;


                startButton.textContent =
                    "🔒 GOALLOCK ACTIVE";

            }


        }

        else {


            if (
                sessionActive
            ) {


                sessionActive =
                    false;


                if (
                    startButton
                ) {

                    startButton.disabled =
                        false;


                    startButton.textContent =
                        "🔒 START GOALLOCK SESSION";

                }


                if (
                    sessionStatus
                ) {

                    sessionStatus.textContent =
                        "🎉 Session completed";

                }


                if (
                    sessionMessage
                ) {

                    sessionMessage.textContent =
                        "Session completed. Your selected websites are now unlocked.";

                }


                timeButtons.forEach(

                    function(button) {

                        button.disabled =
                            false;

                    }

                );


                if (
                    customButton
                ) {

                    customButton.disabled =
                        false;

                }


                showBlockedItems(

                    getSavedDistractions(),

                    false

                );


            }


        }


        if (
            todayFocus
        ) {

            todayFocus.textContent =
                Math.floor(

                    status.total_focus_seconds
                    /
                    60

                )
                +
                " min";

        }


        if (
            todaySessions
        ) {

            todaySessions.textContent =
                status.completed_sessions
                +
                " completed";

        }


    }

    catch (error) {

        console.log(
            "Status update error"
        );

    }


}



updateStatus();


setInterval(

    updateStatus,

    1000

);