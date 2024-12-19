import { IMessage } from "./message";

interface MessageProcessor{
  processMessage(message: IMessage)
}

export { MessageProcessor }