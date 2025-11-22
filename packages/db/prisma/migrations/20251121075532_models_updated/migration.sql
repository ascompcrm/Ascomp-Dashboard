-- CreateTable
CREATE TABLE "Site" (
    "_id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactDetails" TEXT NOT NULL,
    "screenNo" TEXT NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Projector" (
    "_id" TEXT NOT NULL,
    "projectorModel" TEXT NOT NULL,
    "serialNo" TEXT NOT NULL,
    "noOfservices" INTEGER,
    "runningHours" INTEGER,
    "siteId" TEXT NOT NULL,

    CONSTRAINT "Projector_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "service_record" (
    "_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "projectorId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "serviceNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "date" TIMESTAMP(3),
    "cinemaName" TEXT,
    "address" TEXT,
    "contactDetails" TEXT,
    "location" TEXT,
    "screenNumber" TEXT,
    "projectorRunningHours" TEXT,
    "replacementRequired" BOOLEAN NOT NULL DEFAULT false,
    "reflector" TEXT,
    "uvFilter" TEXT,
    "integratorRod" TEXT,
    "coldMirror" TEXT,
    "foldMirror" TEXT,
    "touchPanel" TEXT,
    "evbImcbBoard" TEXT,
    "pibIcpBoard" TEXT,
    "imbSBoard" TEXT,
    "serialNumberVerified" BOOLEAN NOT NULL DEFAULT false,
    "disposableConsumables" TEXT,
    "coolantLevelColor" TEXT,
    "lightEngineWhite" TEXT,
    "lightEngineRed" TEXT,
    "lightEngineGreen" TEXT,
    "lightEngineBlue" TEXT,
    "lightEngineBlack" TEXT,
    "acBlowerVane" TEXT,
    "extractorVane" TEXT,
    "exhaustCfm" TEXT,
    "lightEngineFans" TEXT,
    "cardCageFans" TEXT,
    "radiatorFanPump" TEXT,
    "pumpConnectorHose" TEXT,
    "securityLampHouseLock" TEXT,
    "lampLocMechanism" TEXT,
    "projectorPlacementEnvironment" TEXT,
    "softwareVersion" TEXT,
    "screenHeight" TEXT,
    "screenWidth" TEXT,
    "screenGain" TEXT,
    "screenMake" TEXT,
    "throwDistance" TEXT,
    "lampMakeModel" TEXT,
    "lampTotalRunningHours" TEXT,
    "lampCurrentRunningHours" TEXT,
    "pvVsN" TEXT,
    "pvVsE" TEXT,
    "nvVsE" TEXT,
    "flCenter" TEXT,
    "flLeft" TEXT,
    "flRight" TEXT,
    "contentPlayerModel" TEXT,
    "acStatus" TEXT,
    "leStatus" TEXT,
    "whiteX" TEXT,
    "whiteY" TEXT,
    "whiteFl" TEXT,
    "redX" TEXT,
    "redY" TEXT,
    "redFl" TEXT,
    "greenX" TEXT,
    "greenY" TEXT,
    "greenFl" TEXT,
    "blueX" TEXT,
    "blueY" TEXT,
    "blueFl" TEXT,
    "focusBoresight" BOOLEAN NOT NULL DEFAULT false,
    "integratorPosition" BOOLEAN NOT NULL DEFAULT false,
    "spotsOnScreen" BOOLEAN NOT NULL DEFAULT false,
    "screenCroppingOk" BOOLEAN NOT NULL DEFAULT false,
    "convergenceOk" BOOLEAN NOT NULL DEFAULT false,
    "channelsCheckedOk" BOOLEAN NOT NULL DEFAULT false,
    "pixelDefects" TEXT,
    "imageVibration" TEXT,
    "liteloc" TEXT,
    "hcho" TEXT,
    "tvoc" TEXT,
    "pm1" TEXT,
    "pm2_5" TEXT,
    "pm10" TEXT,
    "temperature" TEXT,
    "humidity" TEXT,
    "remarks" TEXT,
    "lightEngineSerialNumber" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "signatures" JSONB,
    "reportGenerated" BOOLEAN NOT NULL DEFAULT false,
    "reportUrl" TEXT,

    CONSTRAINT "service_record_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_address_key" ON "Site"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Projector_serialNo_key" ON "Projector"("serialNo");

-- CreateIndex
CREATE INDEX "service_record_projectorId_serviceNumber_idx" ON "service_record"("projectorId", "serviceNumber");

-- CreateIndex
CREATE INDEX "service_record_projectorId_date_idx" ON "service_record"("projectorId", "date");

-- CreateIndex
CREATE INDEX "service_record_projectorId_status_idx" ON "service_record"("projectorId", "status");

-- CreateIndex
CREATE INDEX "service_record_userId_date_idx" ON "service_record"("userId", "date");

-- CreateIndex
CREATE INDEX "service_record_siteId_date_idx" ON "service_record"("siteId", "date");

-- CreateIndex
CREATE INDEX "service_record_status_idx" ON "service_record"("status");

-- CreateIndex
CREATE INDEX "service_record_date_idx" ON "service_record"("date");

-- CreateIndex
CREATE UNIQUE INDEX "service_record_projectorId_serviceNumber_key" ON "service_record"("projectorId", "serviceNumber");

-- AddForeignKey
ALTER TABLE "Projector" ADD CONSTRAINT "Projector_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_record" ADD CONSTRAINT "service_record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_record" ADD CONSTRAINT "service_record_projectorId_fkey" FOREIGN KEY ("projectorId") REFERENCES "Projector"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_record" ADD CONSTRAINT "service_record_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
