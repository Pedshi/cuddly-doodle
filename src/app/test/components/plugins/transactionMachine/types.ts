export interface ActionEvent {
  eventType: string;
  args: {
    id: string;
    properties?: Record<string, any>;
    childId?: string;
    type?: string;
  };
}
