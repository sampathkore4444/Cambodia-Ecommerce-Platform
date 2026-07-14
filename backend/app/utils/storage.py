from __future__ import annotations

import abc
import os
import uuid
from datetime import timedelta
from typing import Optional


class BaseStorage(abc.ABC):
    @abc.abstractmethod
    async def upload_file(self, file, folder: str, filename: str) -> str:
        pass

    @abc.abstractmethod
    async def delete_file(self, url: str) -> bool:
        pass

    @abc.abstractmethod
    async def get_presigned_url(self, key: str, expires: int = 3600) -> str:
        pass


class LocalStorage(BaseStorage):
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def upload_file(self, file, folder: str, filename: str) -> str:
        unique_name = f"{uuid.uuid4().hex}_{filename}"
        folder_path = os.path.join(self.upload_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        file_path = os.path.join(folder_path, unique_name)

        content = file.file
        content.seek(0)
        data = content.read()

        with open(file_path, "wb") as f:
            f.write(data)

        return f"/static/uploads/{folder}/{unique_name}"

    async def delete_file(self, url: str) -> bool:
        try:
            if url.startswith("/static/uploads/"):
                relative_path = url[len("/static/uploads/"):]
                full_path = os.path.join(self.upload_dir, relative_path)
                if os.path.exists(full_path):
                    os.remove(full_path)
                    return True
            return False
        except Exception:
            return False

    async def get_presigned_url(self, key: str, expires: int = 3600) -> str:
        return f"/static/uploads/{key}"


class S3Storage(BaseStorage):
    def __init__(self, bucket: str, access_key: str, secret_key: str, region: str = "ap-southeast-1"):
        self.bucket = bucket
        self.access_key = access_key
        self.secret_key = secret_key
        self.region = region

    async def upload_file(self, file, folder: str, filename: str) -> str:
        try:
            import boto3
            from botocore.config import Config

            s3_client = boto3.client(
                "s3",
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region,
                config=Config(signature_version="s3v4"),
            )

            unique_name = f"{uuid.uuid4().hex}_{filename}"
            key = f"{folder}/{unique_name}"

            content = file.file
            content.seek(0)
            data = content.read()

            content_type = file.content_type or "application/octet-stream"
            s3_client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=data,
                ContentType=content_type,
            )

            return f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{key}"
        except Exception:
            return ""

    async def delete_file(self, url: str) -> bool:
        try:
            import boto3

            s3_client = boto3.client(
                "s3",
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region,
            )

            prefix = f"https://{self.bucket}.s3.{self.region}.amazonaws.com/"
            if url.startswith(prefix):
                key = url[len(prefix):]
            else:
                return False

            s3_client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except Exception:
            return False

    async def get_presigned_url(self, key: str, expires: int = 3600) -> str:
        try:
            import boto3
            from botocore.config import Config

            s3_client = boto3.client(
                "s3",
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region,
                config=Config(signature_version="s3v4"),
            )

            url = s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expires,
            )
            return url
        except Exception:
            return ""


class StorageService:
    def __init__(
        self,
        provider: str = "local",
        s3_bucket: str = "",
        s3_access_key: str = "",
        s3_secret_key: str = "",
        s3_region: str = "ap-southeast-1",
        local_upload_dir: str = "uploads",
    ):
        if provider == "s3" and s3_bucket:
            self._storage: BaseStorage = S3Storage(
                bucket=s3_bucket,
                access_key=s3_access_key,
                secret_key=s3_secret_key,
                region=s3_region,
            )
        else:
            self._storage = LocalStorage(upload_dir=local_upload_dir)

    async def upload_file(self, file, folder: str = "general", filename: str = "file") -> str:
        return await self._storage.upload_file(file, folder, filename)

    async def delete_file(self, url: str) -> bool:
        return await self._storage.delete_file(url)

    async def get_presigned_url(self, key: str, expires: int = 3600) -> str:
        return await self._storage.get_presigned_url(key, expires)
