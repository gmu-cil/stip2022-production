export type Categories =
  | 'New Contributions'
  | 'Approved Contributions'
  | 'Rejected Contributions';

export type CategoryList = Record<Categories, Contribution[]>;

type Gender = 'male' | 'female' | 'unknown' | '男性' | '女性' | '未知'
type Ethnicity =
  | 'Han'
  | 'Zhuang'
  | 'Hui'
  | 'Man'
  | 'Uygur'
  | 'Miao'
  | 'Yi'
  | 'Tujia'
  | 'Zang'
  | 'Mongol'
  | 'Dong'
  | 'Bouyei'
  | 'Yao'
  | 'Chosŏn'
  | 'Hani'
  | 'Li'
  | 'Kazak'
  | 'Dai'
  | 'She'
  | 'Lisu'
  | 'Dongxiang'
  | 'Gelao'
  | 'Lahu'
  | 'Wa'
  | 'Sui'
  | 'Naxi'
  | 'Qiang'
  | 'Tu'
  | 'Mulao'
  | 'Xibe'
  | 'Kirgiz'
  | 'Jingpo'
  | 'Daur'
  | 'Salar'
  | 'Blang'
  | 'Maonan'
  | 'Tajik'
  | 'Pumi'
  | 'Achang'
  | 'Nu'
  | 'Ewenki'
  | 'Gin'
  | 'Jino'
  | 'Deang'
  | 'Bonan'
  | 'Russ'
  | 'Yugur'
  | 'Uzbek'
  | 'Monba'
  | 'Oroqen'
  | 'Derung'
  | 'Hezhen'
  | 'Gaoshan'
  | 'Lhoba'
  | 'Tatar'
  | 'Bai';

export type Status = 'deceased' | 'alive' | 'unknown' | '活' | '死者' | '未知'

export type State = 'void' | 'removed';

export type Publish = 'original' | 'new' | 'approved' | 'rejected';

export type Source = 'original' | 'contributed'

export interface Event {
  startYear: number;
  endYear: number;
  event: string;
}

export interface Memoir {
  memoirTitle: string;
  memoirContent: string;
  memoirAuthor: string;
}

export type UploadImagesType = {
  file: File;
  image: string;
  imageId: string;
  imageCategory: string;
  imageDes: string;
  imageDetails: string;
  imageSource: string;
  imageTitle: string;
  imageUpload: string;
  isProfile?: boolean;
  imageUrl: string;
  // other fields
  otherImage: string;
  otherImageCategory: string;
  otherImageDes: string;
  otherImageDetails: string;
  otherImageSource: string;
  otherImageTitle: string;
  otherImageUpload: string;
  otherImageUrl: string;
};

export interface ImagesSchema {
  imageId: string;
  rightistId: string;
  imagePath?: string;
  imageUrl: string;
  isProfile: any;
  isGallery: any;
  category: string;
  title: string;
  detail: string;
  source: string;
}

export interface RightistSchema {
  rightistId: string;
  contributorId: string;
  imageId: string;
  initial: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: Gender;
  birthYear: number;
  deathYear: number;
  rightistYear: number;
  status: Status;
  ethnicity: string;
  birthplace: string,
  education: string,
  job: string;
  detailJob: string;
  workplace: string;
  workplaceCombined: string;
  events: Event[];
  memoirs: Memoir[];
  reference: string;
  description: string;
  source: Source;
  images?: ImagesSchema[];
  lastUpdatedAt: Date; // set from the service when updating a contribution
}

export interface Rightist extends RightistSchema {}

export type langType = {
  en: Contribution;
  cn: Contribution;
};

export type ContributionDetails = Contribution & RightistSchema;

export interface RightistJson {
  [rightistId: string]: RightistSchema;
}

export interface ContributionSchema {
  contributionId: string; // set from the service when creating a new contribution
  contributorId: string; // set from the service when creating a new contribution
  rightist?: RightistSchema;
  image?: ImagesSchema;
  rightistId: string;
  publish: Publish;
  fullName: string;
  lastUpdatedAt: Date;
  contributedAt: Date; // set from the service when creating a new contribution
  approvedAt: Date; // set from the service when approving a contribution
  rejectedAt?: Date; // set from the service when rejecting a contribution
  notificationMessage?: string; // set from the service when approving a contribution
}

export interface Contribution extends ContributionSchema {
  state: State;
}

export interface ContributionJson {
  [contributionId: string]: ContributionSchema;
}

export interface OuterContributionJson {
  [contributorId: string]: ContributionJson;
}



// export interface ImagesSchema {
//   imageId: string;
//   rightistId: string;
//   imagePath?: string;
//   isGallery: boolean;
//   category: string;
//   title: string;
//   detail: string;
//   source: string;
// }

export interface Image extends ImagesSchema {
  opacity: number;
}

export interface ImageJson {
  [imageId: string]: ImagesSchema;
}
