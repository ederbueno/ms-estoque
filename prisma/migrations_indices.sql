-- CreateIndex
CREATE INDEX "Produto_codigo_idx" ON "Produto"("codigo");

-- CreateIndex
CREATE INDEX "Produto_categoria_idx" ON "Produto"("categoria");

-- CreateIndex para data
CREATE INDEX "Produto_createdAt_idx" ON "Produto"("createdAt");

-- CreateIndex composto para buscas comuns
CREATE INDEX "Produto_categoria_nome_idx" ON "Produto"("categoria", "nome");
