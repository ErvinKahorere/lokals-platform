class MessagingService {
  const MessagingService();

  String getPlaceholderMessage(String name) {
    return 'In-app messaging is not ready for this contact yet. Please call or WhatsApp $name for the fastest reply.';
  }
}
