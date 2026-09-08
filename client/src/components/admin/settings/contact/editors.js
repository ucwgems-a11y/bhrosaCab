import ContactMapEditor from "./ContactMapEditor/ContactMapEditor";
import ContactInfoEditor from "./ContactInfoEditor/ContactInfoEditor";
import ContactMessagesEditor from "./ContactMessagesEditor/ContactMessagesEditor";

const contactEditors = {
  map: ContactMapEditor,
  info: ContactInfoEditor,
  messages: ContactMessagesEditor,
};

export default contactEditors;