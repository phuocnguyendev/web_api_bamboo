-- CreateTable
CREATE TABLE "public"."User" (
    "Id" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Phone" TEXT,
    "RoleId" TEXT NOT NULL,
    "Status" BOOLEAN NOT NULL DEFAULT true,
    "Avatar_url" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "Id" TEXT NOT NULL,
    "Code" TEXT NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "Id" TEXT NOT NULL,
    "Code" TEXT NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."RolePermission" (
    "RoleId" TEXT NOT NULL,
    "PermissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("RoleId","PermissionId")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "Id" TEXT NOT NULL,
    "Code" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Material" TEXT,
    "SpecText" TEXT,
    "Uom" TEXT NOT NULL,
    "BaseCost" DOUBLE PRECISION,
    "Status" BOOLEAN NOT NULL DEFAULT true,
    "Note" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Warehouse" (
    "Id" TEXT NOT NULL,
    "Code" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Address" TEXT,
    "Branch" TEXT,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Supplier" (
    "Id" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "TaxCode" TEXT,
    "Phone" TEXT,
    "Email" TEXT,
    "Address" TEXT,
    "Rating" INTEGER,
    "LeadTime" INTEGER,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Stock" (
    "Id" TEXT NOT NULL,
    "WarehouseId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "QtyOnHand" INTEGER NOT NULL DEFAULT 0,
    "MinQty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."StockMovement" (
    "Id" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "RefType" TEXT,
    "RefId" TEXT,
    "WarehouseId" TEXT NOT NULL,
    "WarehouseToId" TEXT,
    "ProductId" TEXT NOT NULL,
    "Qty" INTEGER NOT NULL,
    "UnitCost" DOUBLE PRECISION NOT NULL,
    "Reason" TEXT,
    "OccurredAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Receipt" (
    "Id" TEXT NOT NULL,
    "Code" TEXT NOT NULL,
    "SupplierId" TEXT NOT NULL,
    "WarehouseId" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "ReceivedAt" TIMESTAMP(3) NOT NULL,
    "FreightCost" DOUBLE PRECISION,
    "HandlingCost" DOUBLE PRECISION,
    "OtherCost" DOUBLE PRECISION,
    "Note" TEXT,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."ReceiptItem" (
    "Id" TEXT NOT NULL,
    "ReceiptId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Qty" INTEGER NOT NULL,
    "UnitCost" DOUBLE PRECISION NOT NULL,
    "VatRate" DOUBLE PRECISION,
    "Note" TEXT,

    CONSTRAINT "ReceiptItem_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."StockOutVoucher" (
    "Id" TEXT NOT NULL,
    "Code" TEXT NOT NULL,
    "WarehouseId" TEXT NOT NULL,
    "WarehouseToId" TEXT,
    "Type" TEXT NOT NULL,
    "Reason" TEXT,
    "CostCenterId" TEXT,
    "IssuedAt" TIMESTAMP(3) NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "StockOutVoucher_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."StockOutItem" (
    "Id" TEXT NOT NULL,
    "StockOutVoucherId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Qty" INTEGER NOT NULL,
    "UnitCostSnapshot" DOUBLE PRECISION NOT NULL,
    "Note" TEXT,

    CONSTRAINT "StockOutItem_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "public"."User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_Code_key" ON "public"."Role"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_Code_key" ON "public"."Permission"("Code");

-- CreateIndex
CREATE INDEX "RolePermission_PermissionId_idx" ON "public"."RolePermission"("PermissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_Code_key" ON "public"."Product"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_Code_key" ON "public"."Warehouse"("Code");

-- CreateIndex
CREATE INDEX "Stock_ProductId_idx" ON "public"."Stock"("ProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_WarehouseId_ProductId_key" ON "public"."Stock"("WarehouseId", "ProductId");

-- CreateIndex
CREATE INDEX "StockMovement_WarehouseId_idx" ON "public"."StockMovement"("WarehouseId");

-- CreateIndex
CREATE INDEX "StockMovement_WarehouseToId_idx" ON "public"."StockMovement"("WarehouseToId");

-- CreateIndex
CREATE INDEX "StockMovement_ProductId_idx" ON "public"."StockMovement"("ProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_Code_key" ON "public"."Receipt"("Code");

-- CreateIndex
CREATE INDEX "Receipt_SupplierId_idx" ON "public"."Receipt"("SupplierId");

-- CreateIndex
CREATE INDEX "Receipt_WarehouseId_idx" ON "public"."Receipt"("WarehouseId");

-- CreateIndex
CREATE INDEX "ReceiptItem_ReceiptId_idx" ON "public"."ReceiptItem"("ReceiptId");

-- CreateIndex
CREATE INDEX "ReceiptItem_ProductId_idx" ON "public"."ReceiptItem"("ProductId");

-- CreateIndex
CREATE UNIQUE INDEX "StockOutVoucher_Code_key" ON "public"."StockOutVoucher"("Code");

-- CreateIndex
CREATE INDEX "StockOutVoucher_WarehouseId_idx" ON "public"."StockOutVoucher"("WarehouseId");

-- CreateIndex
CREATE INDEX "StockOutVoucher_WarehouseToId_idx" ON "public"."StockOutVoucher"("WarehouseToId");

-- CreateIndex
CREATE INDEX "StockOutItem_StockOutVoucherId_idx" ON "public"."StockOutItem"("StockOutVoucherId");

-- CreateIndex
CREATE INDEX "StockOutItem_ProductId_idx" ON "public"."StockOutItem"("ProductId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "public"."Role"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermission" ADD CONSTRAINT "RolePermission_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "public"."Role"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermission" ADD CONSTRAINT "RolePermission_PermissionId_fkey" FOREIGN KEY ("PermissionId") REFERENCES "public"."Permission"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_WarehouseId_fkey" FOREIGN KEY ("WarehouseId") REFERENCES "public"."Warehouse"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "public"."Product"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_WarehouseId_fkey" FOREIGN KEY ("WarehouseId") REFERENCES "public"."Warehouse"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_WarehouseToId_fkey" FOREIGN KEY ("WarehouseToId") REFERENCES "public"."Warehouse"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "public"."Product"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Receipt" ADD CONSTRAINT "Receipt_SupplierId_fkey" FOREIGN KEY ("SupplierId") REFERENCES "public"."Supplier"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Receipt" ADD CONSTRAINT "Receipt_WarehouseId_fkey" FOREIGN KEY ("WarehouseId") REFERENCES "public"."Warehouse"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReceiptItem" ADD CONSTRAINT "ReceiptItem_ReceiptId_fkey" FOREIGN KEY ("ReceiptId") REFERENCES "public"."Receipt"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReceiptItem" ADD CONSTRAINT "ReceiptItem_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "public"."Product"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockOutVoucher" ADD CONSTRAINT "StockOutVoucher_WarehouseId_fkey" FOREIGN KEY ("WarehouseId") REFERENCES "public"."Warehouse"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockOutVoucher" ADD CONSTRAINT "StockOutVoucher_WarehouseToId_fkey" FOREIGN KEY ("WarehouseToId") REFERENCES "public"."Warehouse"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockOutItem" ADD CONSTRAINT "StockOutItem_StockOutVoucherId_fkey" FOREIGN KEY ("StockOutVoucherId") REFERENCES "public"."StockOutVoucher"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockOutItem" ADD CONSTRAINT "StockOutItem_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "public"."Product"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
