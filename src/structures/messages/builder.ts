export class MessageBuilder {
  private lines = [];
  build() {
    return this.lines.join();
  }
}