#!/usr/bin/env python3
"""
Database Restore Script
Bu script veritabanını yedekten geri yükler
"""

import os
import shutil
import sys

def restore_database():
    """Veritabanını backup'tan geri yükle"""
    
    # Dosya yolları
    current_db = os.path.join('instance', 'pebdeq.db')
    backup_db = os.path.join('instance', 'pebdeq_backup.db')
    
    try:
        # Backup dosyasının var olup olmadığını kontrol et
        if not os.path.exists(backup_db):
            print(f"❌ Backup dosyası bulunamadı: {backup_db}")
            return False
        
        # Mevcut veritabanını sil
        if os.path.exists(current_db):
            os.remove(current_db)
            print(f"✅ Mevcut veritabanı silindi: {current_db}")
        
        # Backup'ı kopyala
        shutil.copy2(backup_db, current_db)
        print(f"✅ Veritabanı geri yüklendi: {backup_db} -> {current_db}")
        
        print("\n🎉 Veritabanı başarıyla geri yüklendi!")
        print("Şimdi backend'i yeniden başlatabilirsiniz.")
        
        return True
        
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        return False

if __name__ == "__main__":
    print("🔄 Veritabanı geri yükleme işlemi başlatılıyor...")
    print("="*50)
    
    if restore_database():
        sys.exit(0)
    else:
        sys.exit(1) 