class UserChat {
    static conversation = [];
    static getConversation() {
        return this.conversation;
    }
    static setConversation(c) {
        this.conversation = c;
    }
    static setMessage(m){
        this.conversation = [...this.conversation, m];
    }
}
export default UserChat;
