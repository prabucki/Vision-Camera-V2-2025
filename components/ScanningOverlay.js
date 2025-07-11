import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BarcodeFormat } from 'vision-camera-code-scanner';
import SoundManager from './SoundManager';

const { height } = Dimensions.get('window');

// Barcode Item Component
const BarcodeItem = ({ barcode, index, barcodeCounts, newBarcodeKeys, getBarcodeFormatName }) => {
  const displayValue = barcode.displayValue || barcode.rawValue || 'No data';
  const formatName = getBarcodeFormatName(barcode.format);
  const barcodeKey = `${barcode.format}-${barcode.rawValue || barcode.displayValue}`;
  const scanCount = barcodeCounts[barcodeKey] || 1;
  const isNew = newBarcodeKeys.has(barcodeKey);

  return (
    <View
      style={[
        styles.barcodeItem,
      ]}
    >
      <View style={styles.barcodeHeader}>
        <Text style={styles.barcodeFormat}>{formatName}</Text>
        <Text style={[styles.scanCount, isNew && styles.newScanCount]}>
          Scanned: {scanCount}x
        </Text>
      </View>
      <Text style={styles.barcodeValue} numberOfLines={3} ellipsizeMode="tail">
        {displayValue}
      </Text>
    </View>
  );
};

// Scanning Overlay Component
const ScanningOverlay = ({ barcodes }) => {
  const [barcodeCounts, setBarcodeCounts] = useState({});
  const [newBarcodeKeys, setNewBarcodeKeys] = useState(new Set());
  const [newBarcodeDetected, setNewBarcodeDetected] = useState(0);
  const previousBarcodesRef = useRef([]);

  const getBarcodeFormatName = (format) => {
    const formatNames = {
      [BarcodeFormat.QR_CODE]: 'QR Code',
      [BarcodeFormat.CODE_128]: 'Code 128',
      [BarcodeFormat.CODE_39]: 'Code 39',
      [BarcodeFormat.CODE_93]: 'Code 93',
      [BarcodeFormat.CODABAR]: 'Codabar',
      [BarcodeFormat.DATA_MATRIX]: 'Data Matrix',
      [BarcodeFormat.EAN_13]: 'EAN-13',
      [BarcodeFormat.EAN_8]: 'EAN-8',
      [BarcodeFormat.ITF]: 'ITF',
      [BarcodeFormat.UPC_A]: 'UPC-A',
      [BarcodeFormat.UPC_E]: 'UPC-E',
      [BarcodeFormat.PDF417]: 'PDF417',
      [BarcodeFormat.AZTEC]: 'Aztec',
      [BarcodeFormat.UNKNOWN]: 'Unknown',
    };
    return formatNames[format] || 'Unknown';
  };

  const updateBarcodeCounts = useCallback((detectedBarcodes) => {
    const currentBarcodeKeys = detectedBarcodes.map(barcode =>
      `${barcode.format}-${barcode.rawValue || barcode.displayValue}`
    );
    const previousBarcodeKeys = previousBarcodesRef.current.map(barcode =>
      `${barcode.format}-${barcode.rawValue || barcode.displayValue}`
    );

    // Check for new barcodes
    const newKeys = currentBarcodeKeys.filter(key => !previousBarcodeKeys.includes(key));
    if (newKeys.length > 0) {
      // Trigger sound and flash
      setNewBarcodeDetected(prev => prev + 1);
      setNewBarcodeKeys(new Set(newKeys));

      // Clear new barcode highlighting after 1 second
      setTimeout(() => {
        setNewBarcodeKeys(new Set());
      }, 1000);
    }

    setBarcodeCounts(prevCounts => {
      const newCounts = { ...prevCounts };

      // Reset counts for barcodes that are no longer visible
      Object.keys(newCounts).forEach(key => {
        if (!currentBarcodeKeys.includes(key)) {
          delete newCounts[key];
        }
      });

      // Update counts for currently visible barcodes
      currentBarcodeKeys.forEach(key => {
        if (previousBarcodeKeys.includes(key)) {
          // Barcode was visible in previous frame, increment count
          newCounts[key] = (newCounts[key] || 0) + 1;
        } else {
          // New barcode, start counting
          newCounts[key] = 1;
        }
      });

      return newCounts;
    });

    previousBarcodesRef.current = detectedBarcodes;
  }, []);

  // Update barcode counts when barcodes change
  useEffect(() => {
    updateBarcodeCounts(barcodes);
  }, [barcodes, updateBarcodeCounts]);

  return (
    <>
      <SoundManager onNewBarcode={newBarcodeDetected} />

      {/* Barcode overlay */}
      <View style={styles.overlay}>
        {barcodes.length > 0 && (
          <ScrollView style={styles.barcodeList} showsVerticalScrollIndicator={false}>
            {barcodes.map((barcode, index) => (
              <BarcodeItem
                key={index}
                barcode={barcode}
                index={index}
                barcodeCounts={barcodeCounts}
                newBarcodeKeys={newBarcodeKeys}
                getBarcodeFormatName={getBarcodeFormatName}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  barcodeList: {
    flex: 1,
    maxHeight: height * 0.6,
  },
  barcodeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  barcodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barcodeFormat: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  scanCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  newScanCount: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    color: '#FF4500',
  },
  barcodeValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
});

export default ScanningOverlay;
