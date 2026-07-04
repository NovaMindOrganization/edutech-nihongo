-- CreateTable
CREATE TABLE "user_notebooks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notebooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notebook_items" (
    "id" TEXT NOT NULL,
    "notebook_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_type" "MasteryItemType" NOT NULL,
    "note" TEXT,
    "lesson_id" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notebook_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_notebooks_user_id_sort_order_idx" ON "user_notebooks"("user_id", "sort_order");

-- CreateIndex
CREATE INDEX "user_notebook_items_notebook_id_item_type_idx" ON "user_notebook_items"("notebook_id", "item_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_notebook_items_notebook_id_item_id_item_type_key" ON "user_notebook_items"("notebook_id", "item_id", "item_type");

-- AddForeignKey
ALTER TABLE "user_notebooks" ADD CONSTRAINT "user_notebooks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notebook_items" ADD CONSTRAINT "user_notebook_items_notebook_id_fkey" FOREIGN KEY ("notebook_id") REFERENCES "user_notebooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notebook_items" ADD CONSTRAINT "user_notebook_items_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
