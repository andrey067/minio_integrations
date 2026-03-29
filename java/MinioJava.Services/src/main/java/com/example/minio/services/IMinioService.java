package com.example.minio.services;

import java.io.InputStream;
import java.util.List;

public interface IMinioService {
    void createBucket(String bucketName) throws Exception;
    List<String> listBuckets() throws Exception;
    boolean bucketExists(String bucketName) throws Exception;
    void deleteBucket(String bucketName) throws Exception;
    void uploadFile(String bucketName, String objectName, InputStream stream, long size, String contentType) throws Exception;
    InputStream downloadFile(String bucketName, String objectName) throws Exception;
}
