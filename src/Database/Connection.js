export default class Connection {
  checkConnection() {
    this.connection.connect(err => {
      if (err) {
        console.log(`Error connecting: ${err}`);
        return;
      }

      console.log(this.constructor.name + ' connection successful! ' + this.connection.threadId);
    });
  }
}
