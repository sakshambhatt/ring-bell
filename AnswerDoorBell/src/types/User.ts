export type User = {
  firstName: string;
  lastName: string;
  status: 'approved' | 'rejected' | 'review-pending';
};
