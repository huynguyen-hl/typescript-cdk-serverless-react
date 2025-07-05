import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { AuthService } from './AuthService';
import { DataStack, ApiStack } from '../../../outputs.json';
import type { SpaceEntry } from '../components/model/model';

const SpaceApiUrl = ApiStack.SpacesApiEndpoint36C4F3B6 + 'spaces'

export class DataService {
  private awsRegion = 'ap-southeast-1'
  private authService: AuthService;
  private s3Client?: S3Client;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public async reserveSpace(spaceId: string): Promise<SpaceEntry> {
    const reservedSpace = await fetch(`${SpaceApiUrl}?id=${spaceId}`, {
      headers: {
        Authorization: this.authService.jwtToken!
      }
    });

    const reservedSpaceJSON = await reservedSpace.json();
    return reservedSpaceJSON.id;
  }

  public async getSpaces(): Promise<SpaceEntry[]> {
    const spaces = await fetch(SpaceApiUrl, {
      headers: {
        Authorization: this.authService.jwtToken!
      }
    });

    const spacesJSON = await spaces.json();
    return spacesJSON;
  }

  public async createSpace(name: string, location: string, photo?: File) {
    const space = { name, location, photoUrl: '' };

    if (photo) {
      const photoPublicUrl = await this.uploadPublicFile(photo);
      space.photoUrl = photoPublicUrl;
    }

    const createSpaceResult = await fetch(SpaceApiUrl, {
      method: 'POST',
      body: JSON.stringify(space),
      headers: {
        'Authorization': this.authService.jwtToken!
      }
    });

    const createSpaceResultJSON = await createSpaceResult.json();
    console.log('createSpaceResultJSON', createSpaceResultJSON);
    return createSpaceResultJSON.id;
  }

  private async uploadPublicFile(file: File) {
    const credentials = await this.authService.getTemporaryCredentials();
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        credentials,
        region: this.awsRegion
      });
    }

    const fileArrayBuffer = await file.arrayBuffer();
    const uploadCommand = new PutObjectCommand({
      Bucket: DataStack.SpaceFinderPhotosBucketName,
      Key: file.name,
      ACL: 'public-read',
      Body: new Uint8Array(fileArrayBuffer)
    });

    const uploadResult = await this.s3Client.send(uploadCommand);
    console.log('uploadResult', uploadResult);

    return `https://${uploadCommand.input.Bucket}.s3.${this.awsRegion}.amazonaws.com/${uploadCommand.input.Key}`;
  }

  public isAuthorized() {
    return this.authService.isAuthorized();
  }
}