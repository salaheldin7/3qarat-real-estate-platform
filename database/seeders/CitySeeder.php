<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get governorate IDs
        $governorates = DB::table('governorates')->pluck('id', 'name_en')->toArray();

        $cities = [
            // Cairo
            'Cairo' => [
                ['name_en' => 'New Cairo', 'name_ar' => 'القاهرة الجديدة', 'code' => 'NC'],
                ['name_en' => 'Maadi', 'name_ar' => 'المعادي', 'code' => 'MAD'],
                ['name_en' => 'Heliopolis', 'name_ar' => 'مصر الجديدة', 'code' => 'HLP'],
                ['name_en' => 'Downtown', 'name_ar' => 'وسط البلد', 'code' => 'DT'],
                ['name_en' => 'Zamalek', 'name_ar' => 'الزمالك', 'code' => 'ZAM'],
                ['name_en' => 'Nasr City', 'name_ar' => 'مدينة نصر', 'code' => 'NSR'],
                ['name_en' => 'Shubra', 'name_ar' => 'شبرا', 'code' => 'SHB'],
                ['name_en' => 'Ain Shams', 'name_ar' => 'عين شمس', 'code' => 'ASH'],
                ['name_en' => 'Mokattam', 'name_ar' => 'المقطم', 'code' => 'MOK'],
                ['name_en' => 'Rehab City', 'name_ar' => 'مدينة الرحاب', 'code' => 'RHB'],
            ],

            // Alexandria
            'Alexandria' => [
                ['name_en' => 'Sidi Gaber', 'name_ar' => 'سيدي جابر', 'code' => 'SG'],
                ['name_en' => 'Stanley', 'name_ar' => 'ستانلي', 'code' => 'STN'],
                ['name_en' => 'Montaza', 'name_ar' => 'المنتزه', 'code' => 'MTZ'],
                ['name_en' => 'Smouha', 'name_ar' => 'سموحة', 'code' => 'SMH'],
                ['name_en' => 'Miami', 'name_ar' => 'ميامي', 'code' => 'MIA'],
                ['name_en' => 'Gleem', 'name_ar' => 'جليم', 'code' => 'GLM'],
                ['name_en' => 'Sporting', 'name_ar' => 'سبورتنج', 'code' => 'SPT'],
                ['name_en' => 'Roushdy', 'name_ar' => 'رشدي', 'code' => 'RSH'],
                ['name_en' => 'Cleopatra', 'name_ar' => 'كليوباترا', 'code' => 'CLP'],
                ['name_en' => 'San Stefano', 'name_ar' => 'سان ستيفانو', 'code' => 'SST'],
            ],

            // Giza
            'Giza' => [
                ['name_en' => 'Dokki', 'name_ar' => 'الدقي', 'code' => 'DOK'],
                ['name_en' => 'Mohandessin', 'name_ar' => 'المهندسين', 'code' => 'MHN'],
                ['name_en' => '6th of October', 'name_ar' => 'السادس من أكتوبر', 'code' => '6OCT'],
                ['name_en' => 'Sheikh Zayed', 'name_ar' => 'الشيخ زايد', 'code' => 'SZ'],
                ['name_en' => 'Haram', 'name_ar' => 'الهرم', 'code' => 'HRM'],
                ['name_en' => 'Faisal', 'name_ar' => 'فيصل', 'code' => 'FSL'],
                ['name_en' => 'Agouza', 'name_ar' => 'العجوزة', 'code' => 'AGZ'],
                ['name_en' => 'Imbaba', 'name_ar' => 'إمبابة', 'code' => 'IMB'],
                ['name_en' => 'Bulaq al-Dakrour', 'name_ar' => 'بولاق الدكرور', 'code' => 'BLD'],
                ['name_en' => 'Kerdasa', 'name_ar' => 'كرداسة', 'code' => 'KRD'],
            ],

            // Qalyubia
            'Qalyubia' => [
                ['name_en' => 'Benha', 'name_ar' => 'بنها', 'code' => 'BNH'],
                ['name_en' => 'Shubra al-Khaimah', 'name_ar' => 'شبرا الخيمة', 'code' => 'SHK'],
                ['name_en' => 'Qaha', 'name_ar' => 'قها', 'code' => 'QHA'],
                ['name_en' => 'Khanka', 'name_ar' => 'الخانكة', 'code' => 'KHN'],
                ['name_en' => 'Shibin al-Qanater', 'name_ar' => 'شبين القناطر', 'code' => 'SHQ'],
                ['name_en' => 'Tukh', 'name_ar' => 'طوخ', 'code' => 'TKH'],
                ['name_en' => 'Kafr Shukr', 'name_ar' => 'كفر شكر', 'code' => 'KFS'],
                ['name_en' => 'Obour City', 'name_ar' => 'مدينة العبور', 'code' => 'OBR'],
            ],

            // Port Said
            'Port Said' => [
                ['name_en' => 'Port Said', 'name_ar' => 'بورسعيد', 'code' => 'PS'],
                ['name_en' => 'Port Fouad', 'name_ar' => 'بور فؤاد', 'code' => 'PF'],
                ['name_en' => 'Al-Zohour', 'name_ar' => 'الزهور', 'code' => 'ZHR'],
                ['name_en' => 'Al-Manakh', 'name_ar' => 'المناخ', 'code' => 'MNK'],
                ['name_en' => 'Al-Arab', 'name_ar' => 'العرب', 'code' => 'ARB'],
            ],

            // Suez
            'Suez' => [
                ['name_en' => 'Suez', 'name_ar' => 'السويس', 'code' => 'SZ'],
                ['name_en' => 'Ain Sokhna', 'name_ar' => 'العين السخنة', 'code' => 'ASK'],
                ['name_en' => 'Ataqah', 'name_ar' => 'العتقة', 'code' => 'ATQ'],
                ['name_en' => 'Faisal', 'name_ar' => 'فيصل', 'code' => 'FSL'],
                ['name_en' => 'Ganayen', 'name_ar' => 'الجناين', 'code' => 'GNN'],
            ],

            // Luxor
            'Luxor' => [
                ['name_en' => 'Luxor', 'name_ar' => 'الأقصر', 'code' => 'LXR'],
                ['name_en' => 'Esna', 'name_ar' => 'إسنا', 'code' => 'ESN'],
                ['name_en' => 'Armant', 'name_ar' => 'أرمنت', 'code' => 'ARM'],
                ['name_en' => 'Al-Tod', 'name_ar' => 'الطود', 'code' => 'TOD'],
                ['name_en' => 'Al-Qurna', 'name_ar' => 'القرنة', 'code' => 'QRN'],
            ],

            // Aswan
            'Aswan' => [
                ['name_en' => 'Aswan', 'name_ar' => 'أسوان', 'code' => 'ASW'],
                ['name_en' => 'Kom Ombo', 'name_ar' => 'كوم أمبو', 'code' => 'KOM'],
                ['name_en' => 'Edfu', 'name_ar' => 'إدفو', 'code' => 'EDF'],
                ['name_en' => 'Daraw', 'name_ar' => 'دراو', 'code' => 'DRW'],
                ['name_en' => 'Abu Simbel', 'name_ar' => 'أبو سمبل', 'code' => 'ABS'],
            ],

            // Asyut
            'Asyut' => [
                ['name_en' => 'Asyut', 'name_ar' => 'أسيوط', 'code' => 'AST'],
                ['name_en' => 'Dayrut', 'name_ar' => 'ديروط', 'code' => 'DYR'],
                ['name_en' => 'Qusiya', 'name_ar' => 'القوصية', 'code' => 'QUS'],
                ['name_en' => 'Manfalut', 'name_ar' => 'منفلوط', 'code' => 'MNF'],
                ['name_en' => 'Abnoub', 'name_ar' => 'أبنوب', 'code' => 'ABN'],
            ],

            // Beheira
            'Beheira' => [
                ['name_en' => 'Damanhour', 'name_ar' => 'دمنهور', 'code' => 'DMN'],
                ['name_en' => 'Kafr al-Dawwar', 'name_ar' => 'كفر الدوار', 'code' => 'KFD'],
                ['name_en' => 'Rashid', 'name_ar' => 'رشيد', 'code' => 'RSH'],
                ['name_en' => 'Idku', 'name_ar' => 'إدكو', 'code' => 'IDK'],
                ['name_en' => 'Abu al-Matamir', 'name_ar' => 'أبو المطامير', 'code' => 'ABM'],
            ],
        ];

        foreach ($cities as $governorateName => $governorateCities) {
            if (isset($governorates[$governorateName])) {
                $governorateId = $governorates[$governorateName];
                
                foreach ($governorateCities as $city) {
                    DB::table('cities')->insert([
                        'governorate_id' => $governorateId,
                        'name_en' => $city['name_en'],
                        'name_ar' => $city['name_ar'],
                        'code' => $city['code'],
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
