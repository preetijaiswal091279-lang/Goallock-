from flask import Flask, render_template, request, jsonify

from session_manager import SessionManager


app = Flask(__name__)

session_manager = SessionManager()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/block")
def block():
    return render_template("block.html")


@app.route("/progress")
def progress():
    return render_template("progress.html")


@app.route("/history")
def history():
    return render_template("history.html")


@app.route("/settings")
def settings():
    return render_template("settings.html")


@app.route("/api/start-session", methods=["POST"])
def start_session():

    data = request.get_json() or {}

    minutes = data.get("minutes", 45)

    distractions = data.get(
        "distractions",
        []
    )


    if not distractions:

        return jsonify({
            "success": False,
            "message":
                "Select at least one website or app first."
        })


    result = session_manager.start_session(
        minutes,
        distractions
    )


    return jsonify(result)


@app.route("/api/status")
def status():

    return jsonify(
        session_manager.get_status()
    )


@app.route("/api/progress")
def get_progress():

    return jsonify(
        session_manager.get_progress()
    )


@app.route("/api/history")
def get_history():

    return jsonify(
        session_manager.get_history()
    )


if __name__ == "__main__":

    app.run(
        debug=True,
        use_reloader=False
    )