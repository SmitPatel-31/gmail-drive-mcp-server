// driveService.js - Google Drive API operations
import { google } from 'googleapis';

export class DriveService {
  constructor(auth) {
    this.drive = google.drive({ version: 'v3', auth });
  }

  async searchFiles(query, maxResults = 10) {
    try {
      const response = await this.drive.files.list({
        q: query,
        pageSize: maxResults,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime)',
      });

      return {
        success: true,
        data: {
          files: response.data.files,
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Drive search failed: ${error.message}`
      };
    }
  }

  async getFileContent(fileId) {
    try {
      const file = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size',
      });

      // For text files, get content
      if (file.data.mimeType.includes('text') || file.data.mimeType.includes('document')) {
        const content = await this.drive.files.export({
          fileId: fileId,
          mimeType: 'text/plain',
        });

        return {
          success: true,
          data: {
            file: file.data,
            content: content.data,
          }
        };
      }

      return {
        success: true,
        data: {
          file: file.data,
          message: 'File content not readable (binary or unsupported type)',
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get file content: ${error.message}`
      };
    }
  }

  async getFileMetadata(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink',
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get file metadata: ${error.message}`
      };
    }
  }

  async listFolders(parentId = 'root') {
    try {
      const response = await this.drive.files.list({
        q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
        fields: 'files(id, name, createdTime, modifiedTime)',
      });

      return {
        success: true,
        data: {
          folders: response.data.files,
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to list folders: ${error.message}`
      };
    }
  }

  async createFile(name, content, mimeType = 'text/plain', parentId = null) {
    try {
      const fileMetadata = {
        name: name,
        ...(parentId && { parents: [parentId] })
      };

      const media = {
        mimeType: mimeType,
        body: content
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, size, createdTime'
      });

      return {
        success: true,
        data: {
          file: response.data,
          message: 'File created successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to create file: ${error.message}`
      };
    }
  }

  async updateFile(fileId, content, mimeType = 'text/plain') {
    try {
      const media = {
        mimeType: mimeType,
        body: content
      };

      const response = await this.drive.files.update({
        fileId: fileId,
        media: media,
        fields: 'id, name, mimeType, size, modifiedTime'
      });

      return {
        success: true,
        data: {
          file: response.data,
          message: 'File updated successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to update file: ${error.message}`
      };
    }
  }

  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId
      });

      return {
        success: true,
        data: {
          fileId: fileId,
          message: 'File deleted successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to delete file: ${error.message}`
      };
    }
  }

  async createFolder(name, parentId = null) {
    try {
      const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId && { parents: [parentId] })
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id, name, mimeType, createdTime'
      });

      return {
        success: true,
        data: {
          folder: response.data,
          message: 'Folder created successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to create folder: ${error.message}`
      };
    }
  }

  async copyFile(fileId, name, parentId = null) {
    try {
      const fileMetadata = {
        name: name,
        ...(parentId && { parents: [parentId] })
      };

      const response = await this.drive.files.copy({
        fileId: fileId,
        resource: fileMetadata,
        fields: 'id, name, mimeType, size, createdTime'
      });

      return {
        success: true,
        data: {
          file: response.data,
          message: 'File copied successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to copy file: ${error.message}`
      };
    }
  }

  async moveFile(fileId, newParentId, removeParents = null) {
    try {
      const response = await this.drive.files.update({
        fileId: fileId,
        addParents: newParentId,
        removeParents: removeParents,
        fields: 'id, name, parents'
      });

      return {
        success: true,
        data: {
          file: response.data,
          message: 'File moved successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to move file: ${error.message}`
      };
    }
  }

  async shareFile(fileId, email, role = 'reader', type = 'user') {
    try {
      const response = await this.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: role,
          type: type,
          emailAddress: email
        }
      });

      return {
        success: true,
        data: {
          permission: response.data,
          message: `File shared with ${email}`
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to share file: ${error.message}`
      };
    }
  }

  async getFilePermissions(fileId) {
    try {
      const response = await this.drive.permissions.list({
        fileId: fileId,
        fields: 'permissions(id, emailAddress, role, type)'
      });

      return {
        success: true,
        data: {
          permissions: response.data.permissions
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to get file permissions: ${error.message}`
      };
    }
  }

  async uploadFile(name, buffer, mimeType, parentId = null) {
    try {
      const fileMetadata = {
        name: name,
        ...(parentId && { parents: [parentId] })
      };

      const media = {
        mimeType: mimeType,
        body: buffer
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, size, createdTime'
      });

      return {
        success: true,
        data: {
          file: response.data,
          message: 'File uploaded successfully'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to upload file: ${error.message}`
      };
    }
  }
}