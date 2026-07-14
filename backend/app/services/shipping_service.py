from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import BadRequestException, NotFoundException
from app.models.order import Order, OrderItem
from app.models.product import Product

_SHPPING_PARTNERS = [
    {
        "id": "jtexpress",
        "name": "JT Express",
        "name_kh": "JT Express",
        "logo_url": "/images/shipping/jt-express.png",
        "phone": "010 999 888",
        "website": "https://www.jtexpress.kh",
    },
    {
        "id": "wing_mall",
        "name": "Wing Mall",
        "name_kh": "វីង ម៉ល",
        "logo_url": "/images/shipping/wing-mall.png",
        "phone": "016 999 888",
        "website": "https://mall.wingmoney.com",
    },
    {
        "id": "khmer_post",
        "name": "Khmer Post",
        "name_kh": "ប្រៃសណីយ៍កម្ពុជា",
        "logo_url": "/images/shipping/khmer-post.png",
        "phone": "023 722 000",
        "website": "https://www.khmerpost.com.kh",
    },
    {
        "id": "lalamove",
        "name": "Lalamove Cambodia",
        "name_kh": "ឡាឡាមូវ",
        "logo_url": "/images/shipping/lalamove.png",
        "phone": "081 999 888",
        "website": "https://www.lalamove.com/khm",
    },
]

_PROVINCE_BASE_RATES: dict[str, float] = {
    "phnom_penh": 1.5,
    "kandal": 2.0,
    "siem_reap": 3.0,
    "battambang": 2.5,
    "preah_sihanouk": 3.0,
    "kampong_cham": 2.5,
    "kampong_chhnang": 2.5,
    "kampong_speu": 2.5,
    "kampong_thom": 3.0,
    "kampot": 3.0,
    "kep": 3.0,
    "koh_kong": 3.5,
    "kratie": 3.0,
    "mondulkiri": 4.0,
    "oddar_meanchey": 3.5,
    "pailin": 3.5,
    "preah_vihear": 3.5,
    "prey_veng": 2.5,
    "pursat": 3.0,
    "ratanakiri": 4.5,
    "stung_treng": 4.0,
    "svay_rieng": 2.5,
    "takeo": 2.5,
    "tboung_khmum": 2.5,
}

_CAMBODIAN_PROVINCES = [
    {
        "name": "Phnom Penh",
        "name_kh": "ភ្នំពេញ",
        "slug": "phnom_penh",
        "districts": [
            "Chamkarmon", "Daun Penh", "Prampi Makara", "Toul Kork",
            "Dangkor", "Meanchey", "Russey Keo", "Sen Sok",
            "Pou Senchey", "Chrouy Changvar", "Prek Pnov", "Chbar Ampov",
            "Boeng Keng Kang", "Kamboul",
        ],
    },
    {
        "name": "Kandal",
        "name_kh": "កណ្តាល",
        "slug": "kandal",
        "districts": [
            "Kandal Stueng", "Kien Svay", "Khsach Kandal", "Kaoh Thum",
            "Leuk Daek", "Lvea Aem", "Mukh Kampul", "Angk Snuol",
            "Ponhea Lueu", "S'ang", "Ta Khmau",
        ],
    },
    {
        "name": "Siem Reap",
        "name_kh": "សៀមរាប",
        "slug": "siem_reap",
        "districts": [
            "Angkor Chum", "Angkor Thom", "Banteay Srei", "Chi Kraeng",
            "Kralanh", "Puok", "Prasat Bakong", "Siem Reap",
            "Soutr Nikom", "Srei Snam", "Svay Leu", "Varin",
        ],
    },
    {
        "name": "Battambang",
        "name_kh": "បាត់ដំបង",
        "slug": "battambang",
        "districts": [
            "Banan", "Thma Koul", "Battambang", "Bavel", "Ek Phnom",
            "Moung Ruessei", "Rotanak Mondol", "Sangkae", "Samlout",
            "Sampov Loun", "Phnom Proek", "Kamrieng", "Koas Krala",
            "Rukhak Kiri",
        ],
    },
    {
        "name": "Preah Sihanouk",
        "name_kh": "ព្រះសីហនុ",
        "slug": "preah_sihanouk",
        "districts": [
            "Mittakpheap", "Prey Nob", "Stueng Hav", "Kampong Seila",
            "Kaoh Rung", "Preah Sihanouk",
        ],
    },
    {
        "name": "Kampong Cham",
        "name_kh": "កំពង់ចាម",
        "slug": "kampong_cham",
        "districts": [
            "Kampong Cham", "Kampong Siem", "Kang Meas", "Kaoh Soutin",
            "Prey Chhor", "Srei Santhor", "Steung Trang", "Batheay",
            "Chamkar Leu", "Cheung Prey", "Dambae", "Kroch Chhmar",
            "Ponhea Kraek", "Tboung Khmum",
        ],
    },
    {
        "name": "Kampong Chhnang",
        "name_kh": "កំពង់ឆ្នាំង",
        "slug": "kampong_chhnang",
        "districts": [
            "Baribour", "Chol Kiri", "Kampong Chhnang", "Kampong Leaeng",
            "Kampong Tralach", "Rolea B'ier", "Sameakki Mean Chey",
        ],
    },
    {
        "name": "Kampong Speu",
        "name_kh": "កំពង់ស្ពឺ",
        "slug": "kampong_speu",
        "districts": [
            "Basedth", "Chbar Mon", "Kong Pisei", "Aoral",
            "Odongk", "Phnom Sruoch", "Samraong Tong", "Thpong",
        ],
    },
    {
        "name": "Kampong Thom",
        "name_kh": "កំពង់ធំ",
        "slug": "kampong_thom",
        "districts": [
            "Baray", "Kampong Svay", "Kampong Thom", "Prasat Balangk",
            "Prasat Sambour", "Sandaan", "Santuk", "Stoung",
        ],
    },
    {
        "name": "Kampot",
        "name_kh": "កំពត",
        "slug": "kampot",
        "districts": [
            "Angkor Chey", "Banteay Meas", "Chhuk", "Chum Kiri",
            "Dang Tong", "Kampong Bay", "Kampot", "Kampong Trach",
            "Tuek Chhou",
        ],
    },
    {
        "name": "Kep",
        "name_kh": "កែប",
        "slug": "kep",
        "districts": ["Damnak Chang'aeur", "Kep"],
    },
    {
        "name": "Koh Kong",
        "name_kh": "កោះកុង",
        "slug": "koh_kong",
        "districts": [
            "Botum Sakor", "Kiri Sakor", "Koh Kong", "Mondol Seima",
            "Srae Ambel", "Thma Bang", "Khemarak Phoumin",
        ],
    },
    {
        "name": "Kratie",
        "name_kh": "ក្រចេះ",
        "slug": "kratie",
        "districts": [
            "Chhloung", "Kratie", "Prek Prasab", "Sambour",
            "Snuol", "Chetr Borei",
        ],
    },
    {
        "name": "Mondulkiri",
        "name_kh": "មណ្ឌលគិរី",
        "slug": "mondulkiri",
        "districts": [
            "Kaev Seima", "Kaoh Nheaek", "Ou Reang", "Pechr Chenda",
            "Saen Monourom",
        ],
    },
    {
        "name": "Oddar Meanchey",
        "name_kh": "ឧត្តរមានជ័យ",
        "slug": "oddar_meanchey",
        "districts": [
            "Anlong Veng", "Banteay Ampil", "Chong Kal", "Samraong",
            "Trapeang Prasat",
        ],
    },
    {
        "name": "Pailin",
        "name_kh": "ប៉ៃលិន",
        "slug": "pailin",
        "districts": ["Pailin", "Sala Krau"],
    },
    {
        "name": "Preah Vihear",
        "name_kh": "ព្រះវិហារ",
        "slug": "preah_vihear",
        "districts": [
            "Chey Saen", "Chhaeb", "Choam Khsant", "Kuleaen",
            "Rovieng", "Sangkum Thmei", "Tbaeng Meanchey",
        ],
    },
    {
        "name": "Prey Veng",
        "name_kh": "ព្រៃវែង",
        "slug": "prey_veng",
        "districts": [
            "Ba Phnum", "Kamchay Mear", "Kampong Trabaek", "Kanhchriech",
            "Me Sang", "Peam Chor", "Peam Ro", "Pea Reang",
            "Preah Sdach", "Prey Veng", "Sithor Kandal", "Sva Antor",
        ],
    },
    {
        "name": "Pursat",
        "name_kh": "ពោធិ៍សាត់",
        "slug": "pursat",
        "districts": [
            "Bakan", "Kandieng", "Krakor", "Phnum Kravanh",
            "Pursat", "Veal Veaeng", "Ta Lou Sen Chey",
        ],
    },
    {
        "name": "Ratanakiri",
        "name_kh": "រតនគិរី",
        "slug": "ratanakiri",
        "districts": [
            "Andoung Meas", "Ban Lung", "Bar Kaev", "Koun Mom",
            "Lumphat", "Ou Chum", "Ou Ya Dav", "Ta Veaeng",
        ],
    },
    {
        "name": "Stung Treng",
        "name_kh": "ស្ទឹងត្រែង",
        "slug": "stung_treng",
        "districts": [
            "Sesan", "Siem Bouk", "Siem Pang", "Stung Treng",
            "Thala Barivat", "Borei O' Svay Sen Chey",
        ],
    },
    {
        "name": "Svay Rieng",
        "name_kh": "ស្វាយរៀង",
        "slug": "svay_rieng",
        "districts": [
            "Chantrea", "Kampong Rou", "Romeas Haek", "Rumduol",
            "Svay Chrum", "Svay Rieng", "Svay Teap", "Bavet",
        ],
    },
    {
        "name": "Takeo",
        "name_kh": "តាកែវ",
        "slug": "takeo",
        "districts": [
            "Angkor Borei", "Bati", "Borei Cholsar", "Kiri Vong",
            "Kaoh Andaet", "Prey Kabbas", "Samraong", "Takeo",
            "Tram Kak", "Treang",
        ],
    },
    {
        "name": "Tboung Khmum",
        "name_kh": "ត្បូងឃ្មុំ",
        "slug": "tboung_khmum",
        "districts": [
            "Dambae", "Krouch Chhmar", "Memut", "Ou Reang Ov",
            "Ponhea Kraek", "Suong", "Tboung Khmum",
        ],
    },
]


async def calculate_shipping_cost(
    db: AsyncSession,
    items: list,
    destination_province: str,
    destination_district: str,
) -> dict:
    total_weight = 0.0
    total_value = 0.0

    for item in items:
        product_id = item.get("product_id")
        quantity = item.get("quantity", 1)
        result = await db.execute(
            select(Product).where(Product.id == product_id)
        )
        product = result.scalar_one_or_none()
        if product:
            weight = (product.weight_grams or 200) / 1000 * quantity
            total_weight += weight
            price = float(product.price)
            total_value += price * quantity

    base_rate = _get_base_rate(destination_province)

    partners = []
    for partner in _SHPPING_PARTNERS:
        if partner["id"] == "lalamove" and base_rate > 3.0:
            continue

        weight_charge = total_weight * 0.5
        distance_factor = base_rate
        insurance = total_value * 0.001

        cost = round(
            max(
                weight_charge + distance_factor + insurance,
                1.5,
            ),
            2,
        )

        estimated_days = 1
        if partner["id"] == "lalamove":
            estimated_days = 1
        elif partner["id"] == "jtexpress":
            estimated_days = 1 if base_rate <= 2.5 else 2
        elif partner["id"] == "wing_mall":
            estimated_days = 1 if base_rate <= 2.0 else 2
        elif partner["id"] == "khmer_post":
            estimated_days = 2 if base_rate <= 3.0 else 3

        partners.append(
            {
                "partner": partner,
                "cost": cost,
                "estimated_days": estimated_days,
                "estimated_days_label": f"{estimated_days}-{estimated_days + 1} business days",
            }
        )

    partners.sort(key=lambda p: p["cost"])

    return {
        "destination": {
            "province": destination_province,
            "district": destination_district,
        },
        "total_weight_kg": round(total_weight, 2),
        "total_value": round(total_value, 2),
        "options": partners,
    }


async def get_shipping_provinces() -> list:
    return _CAMBODIAN_PROVINCES


async def track_shipment(tracking_number: str, partner: str) -> dict:
    tracking_states = [
        {
            "status": "picked_up",
            "label": "Package Picked Up",
            "label_kh": "បានប្រមូលកញ្ចប់",
            "timestamp": None,
            "completed": True,
        },
        {
            "status": "in_transit",
            "label": "In Transit",
            "label_kh": "កំពុងដឹកជញ្ជូន",
            "timestamp": None,
            "completed": True,
        },
        {
            "status": "sorting",
            "label": "At Sorting Center",
            "label_kh": "នៅមជ្ឈមណ្ឌលតម្រៀប",
            "timestamp": None,
            "completed": True,
        },
        {
            "status": "out_for_delivery",
            "label": "Out for Delivery",
            "label_kh": "កំពុងប្រគល់",
            "timestamp": None,
            "completed": False,
        },
        {
            "status": "delivered",
            "label": "Delivered",
            "label_kh": "បានទទួល",
            "timestamp": None,
            "completed": False,
        },
    ]

    return {
        "tracking_number": tracking_number,
        "partner": partner,
        "current_status": "sorting",
        "tracking": tracking_states,
    }


def _get_base_rate(province: str) -> float:
    normalized = province.lower().replace(" ", "_").replace("-", "_")
    return _PROVINCE_BASE_RATES.get(normalized, 3.5)
