
type ContactUs = {
  name: string;
  email: string;
  message: string;
};

type RequestModification = {
  email: string;
  rightistId: string;
  modifyRequest: string;
  reasonRequest: string;
  url?: string;
  [key: string]: string;
};

export {ContactUs, RequestModification};
