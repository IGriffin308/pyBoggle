class BoggleGame {

    constructor(boardId, secs = 60) {
        this.secs = secs;
        this.showTimer();
        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId);
        this.timer = setInterval(this.tick.bind(this), 1000);
        $(".guess", this.board).on("submit", this.handleSubmit.bind(this));
    }

    async handleSubmit(evt) {
        evt.preventDefault();
        const $word = $(".word", this.board);
        let word = $word.val();
        if (!word) return;
        if (this.words.has(word)) {
            this.showMessage(`"${word}" is already used.`, "err");
            return;
        }
        const resp = await axios.get("/check-word", { params: { word: word }});
        if (resp.data.result === "not-word") {
            this.showMessage(`"${word}" is not a word`, "err");
        } else if (resp.data.result === "not-on-board") {
            this.showMessage(`"${word}" does not appear board`, "err");
        } else {
            this.showWord(word);
            this.score += word.length;
            this.showScore();
            this.words.add(word);
            this.showMessage(`Found: "${word}," +${word.length} to Score!`, "ok");
        }
        $word.val("").focus();
    }
    showWord(word) {
        $(".words", this.board).append($("<li>", { text: word }));
    }
    showScore() {
        $(".score", this.board).text(this.score);
    }
    showMessage(msg, cls) {
        $(".msg", this.board)
          .text(msg)
          .removeClass()
          .addClass(`msg ${cls}`);
    }
    showTimer() {
        $(".timer", this.board).text(this.secs);
    }
    async tick() {
        this.secs -= 1;
        this.showTimer();
    
        if (this.secs === 0) {
          clearInterval(this.timer);
          await this.scoreGame();
        }
    }
    async scoreGame() {
        $(".guess", this.board).hide();
        const resp = await axios.post("/post-score", { score: this.score });
        if (resp.data.brokeRecord) {
          this.showMessage(`New record: ${this.score}`, "ok");
        } else {
          this.showMessage(`Final score: ${this.score}`, "ok");
        }
    }
}