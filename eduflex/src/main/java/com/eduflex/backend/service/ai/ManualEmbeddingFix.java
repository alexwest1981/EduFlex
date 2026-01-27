package com.eduflex.backend.service.ai;

import com.eduflex.backend.model.VectorStoreEntry;
import org.springframework.stereotype.Service;

@Service
public class ManualEmbeddingFix {
    public void test() {
        VectorStoreEntry e = new VectorStoreEntry();
        e.setCourseId(1L);
        e.setDocumentId(1L);
        e.setTextChunk("test");
        e.setEmbeddingVector(new Double[] { 1.0 });
    }
}
