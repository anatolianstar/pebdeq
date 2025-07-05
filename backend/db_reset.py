#!/usr/bin/env python

"""
Veri tabanını sıfırlamak için basit script
Kullanım: python db_reset.py
"""

from run import reset_database, init_database, create_default_site_settings

if __name__ == '__main__':
    print("⚠️  DİKKAT: Bu işlem, veritabanındaki tüm verileri silecek! ⚠️")
    confirm = input("Veritabanını sıfırlamak istediğinizden emin misiniz? (e/H): ")

    if confirm.lower() in ['e', 'evet', 'y', 'yes']:
        reset_database()
        init_database()
        create_default_site_settings()
        print("\n✅ Veritabanı başarıyla sıfırlandı ve yeniden başlatıldı!")
    else:
        print("\n❌ Veritabanı sıfırlama işlemi iptal edildi.")
