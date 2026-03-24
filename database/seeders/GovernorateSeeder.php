<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GovernorateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $governorates = [
            ['name_en' => 'Cairo', 'name_ar' => 'القاهرة', 'code' => 'CAI'],
            ['name_en' => 'Alexandria', 'name_ar' => 'الإسكندرية', 'code' => 'ALX'],
            ['name_en' => 'Giza', 'name_ar' => 'الجيزة', 'code' => 'GIZ'],
            ['name_en' => 'Qalyubia', 'name_ar' => 'القليوبية', 'code' => 'QLY'],
            ['name_en' => 'Port Said', 'name_ar' => 'بورسعيد', 'code' => 'PTS'],
            ['name_en' => 'Suez', 'name_ar' => 'السويس', 'code' => 'SUZ'],
            ['name_en' => 'Luxor', 'name_ar' => 'الأقصر', 'code' => 'LXR'],
            ['name_en' => 'Aswan', 'name_ar' => 'أسوان', 'code' => 'ASN'],
            ['name_en' => 'Asyut', 'name_ar' => 'أسيوط', 'code' => 'AST'],
            ['name_en' => 'Beheira', 'name_ar' => 'البحيرة', 'code' => 'BHR'],
            ['name_en' => 'Beni Suef', 'name_ar' => 'بني سويف', 'code' => 'BNS'],
            ['name_en' => 'Dakahlia', 'name_ar' => 'الدقهلية', 'code' => 'DKH'],
            ['name_en' => 'Damietta', 'name_ar' => 'دمياط', 'code' => 'DMT'],
            ['name_en' => 'Fayyum', 'name_ar' => 'الفيوم', 'code' => 'FYM'],
            ['name_en' => 'Gharbia', 'name_ar' => 'الغربية', 'code' => 'GHR'],
            ['name_en' => 'Ismailia', 'name_ar' => 'الإسماعيلية', 'code' => 'ISM'],
            ['name_en' => 'Kafr el-Sheikh', 'name_ar' => 'كفر الشيخ', 'code' => 'KFS'],
            ['name_en' => 'Matrouh', 'name_ar' => 'مطروح', 'code' => 'MTR'],
            ['name_en' => 'Minya', 'name_ar' => 'المنيا', 'code' => 'MNY'],
            ['name_en' => 'Monufia', 'name_ar' => 'المنوفية', 'code' => 'MNF'],
            ['name_en' => 'New Valley', 'name_ar' => 'الوادي الجديد', 'code' => 'WAD'],
            ['name_en' => 'North Sinai', 'name_ar' => 'شمال سيناء', 'code' => 'SIN'],
            ['name_en' => 'Qena', 'name_ar' => 'قنا', 'code' => 'QNA'],
            ['name_en' => 'Red Sea', 'name_ar' => 'البحر الأحمر', 'code' => 'SEA'],
            ['name_en' => 'Sharqia', 'name_ar' => 'الشرقية', 'code' => 'SHR'],
            ['name_en' => 'Sohag', 'name_ar' => 'سوهاج', 'code' => 'SOH'],
            ['name_en' => 'South Sinai', 'name_ar' => 'جنوب سيناء', 'code' => 'SIS'],
            ['name_en' => 'Tanta', 'name_ar' => 'طنطا', 'code' => 'TNT'],
        ];

        foreach ($governorates as $governorate) {
            DB::table('governorates')->insert([
                'name_en' => $governorate['name_en'],
                'name_ar' => $governorate['name_ar'],
                'code' => $governorate['code'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
