// This augments the Express namespace with multer-s3 types
declare namespace Express {
    namespace MulterS3 {
      interface File {
        bucket: string;
        key: string;
        acl: string;
        contentType: string;
        contentDisposition: string;
        storageClass: string;
        serverSideEncryption: string;
        metadata: { [key: string]: string };
        location: string;
        etag: string;
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
      }
    }
  }