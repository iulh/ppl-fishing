import { GameConfig, LootItem, Rarity, RodUpgrade } from './types';

export const RARITY_COLORS: Record<Rarity, string> = {
    [Rarity.COMMON]: '#9d9d9d',
    [Rarity.UNCOMMON]: '#1eff00',
    [Rarity.RARE]: '#0070dd',
    [Rarity.EPIC]: '#a335ee',
    [Rarity.LEGENDARY]: '#ff8000'
};

export const RARITY_NAMES: Record<Rarity, string> = {
    [Rarity.COMMON]: 'Обычный',
    [Rarity.UNCOMMON]: 'Необычный',
    [Rarity.RARE]: 'Редкий',
    [Rarity.EPIC]: 'Эпический',
    [Rarity.LEGENDARY]: 'Легендарный'
};

export const RARITY_BG: Record<Rarity, string> = {
    [Rarity.COMMON]: 'rgba(157,157,157,0.15)',
    [Rarity.UNCOMMON]: 'rgba(30,255,0,0.15)',
    [Rarity.RARE]: 'rgba(0,112,221,0.15)',
    [Rarity.EPIC]: 'rgba(163,53,238,0.15)',
    [Rarity.LEGENDARY]: 'rgba(255,128,0,0.15)'
};

export const LOOT_TABLE: LootItem[] = [
    // Common
    {
        id: 'perch',
        name: 'Окунь',
        description: 'Обычный речной окунь. Ничего особенного.',
        rarity: Rarity.COMMON,
        emoji: '🐟',
        isFish: true,
        weight: { min: 0.2, max: 1.5 },
        resistance: 0.2,
        price: 5
    },
    {
        id: 'roach',
        name: 'Плотва',
        description: 'Маленькая серебристая рыбка.',
        rarity: Rarity.COMMON,
        emoji: '🐟',
        isFish: true,
        weight: { min: 0.1, max: 0.8 },
        resistance: 0.15,
        price: 3
    },
    {
        id: 'boot',
        name: 'Старый ботинок',
        description: 'Кто-то потерял ботинок... давно.',
        rarity: Rarity.COMMON,
        emoji: '👢',
        isFish: false,
        resistance: 0.05,
        price: 1
    },
    {
        id: 'seaweed',
        name: 'Водоросли',
        description: 'Пучок речных водорослей.',
        rarity: Rarity.COMMON,
        emoji: '🌿',
        isFish: false,
        resistance: 0.05,
        price: 1
    },
    {
        id: 'tin_can',
        name: 'Жестяная банка',
        description: 'Консерва без этикетки. Может сдать на металл?',
        rarity: Rarity.COMMON,
        emoji: '🥫',
        isFish: false,
        resistance: 0.05,
        price: 1
    },
    {
        id: 'crucian',
        name: 'Карась',
        description: 'Он уже дуреет.',
        rarity: Rarity.COMMON,
        emoji: '🐟',
        isFish: true,
        weight: { min: 0.1, max: 1.0 },
        resistance: 0.18,
        price: 4
    },
    {
        id: 'plastic_bag',
        name: 'Пакет из Магнита',
        description: 'Вы уверены, что этот водоем подходит для рыбалки?',
        rarity: Rarity.COMMON,
        emoji: '🛍️',
        isFish: false,
        resistance: 0.03,
        price: 1
    },
    {
        id: 'gudgeon',
        name: 'Пескарь',
        description: 'Как песок, только рыба.',
        rarity: Rarity.COMMON,
        emoji: '🐟',
        isFish: true,
        weight: { min: 0.05, max: 0.3 },
        resistance: 0.1,
        price: 2
    },
    {
        id: 'pasta',
        name: 'Макароны',
        description: 'Упаковка макарон из магазина "Макфа". Видимо, кто-то уронил.',
        rarity: Rarity.COMMON,
        emoji: '🍝',
        isFish: false,
        resistance: 0.08,
        price: 2
    },

    // Uncommon
    {
        id: 'pike',
        name: 'Щука',
        description: 'Кажется, эта не говорит...',
        rarity: Rarity.UNCOMMON,
        emoji: '🐊',
        isFish: true,
        weight: { min: 1.0, max: 4.0 },
        resistance: 0.4,
        price: 15
    },
    {
        id: 'carp',
        name: 'Карп',
        description: 'Крупный и сильный карп.',
        rarity: Rarity.UNCOMMON,
        emoji: '🐟',
        isFish: true,
        weight: { min: 1.5, max: 5.0 },
        resistance: 0.45,
        price: 18
    },
    {
        id: 'bottle',
        name: 'Бутылка с запиской',
        description:
            'Кажется, чья-то шутка. Хотя может кто-то действительно просит о помощи.',
        rarity: Rarity.UNCOMMON,
        emoji: '🍾',
        isFish: false,
        resistance: 0.1,
        price: 8
    },
    {
        id: 'catfish',
        name: 'Сом',
        description: 'Усатый донный обитатель.',
        rarity: Rarity.UNCOMMON,
        emoji: '🐡',
        isFish: true,
        weight: { min: 2.0, max: 8.0 },
        resistance: 0.5,
        price: 22
    },
    {
        id: 'nokia',
        name: 'Nokia 3310',
        description: 'Всё ещё заряжена. 97% батареи.',
        rarity: Rarity.UNCOMMON,
        emoji: '📱',
        isFish: false,
        resistance: 0.15,
        price: 12
    },
    {
        id: 'rubber_duck',
        name: 'Резиновая уточка',
        description: 'Кря! Кто-то по ней скучает.',
        rarity: Rarity.UNCOMMON,
        emoji: '🦆',
        isFish: false,
        resistance: 0.08,
        price: 7
    },
    {
        id: 'bream',
        name: 'Лещ',
        description: 'Широкий и увесистый. Мечта рыбака.',
        rarity: Rarity.UNCOMMON,
        emoji: '🐟',
        isFish: true,
        weight: { min: 1.0, max: 3.5 },
        resistance: 0.35,
        price: 14
    },
    {
        id: 'crocs',
        name: 'Кроксы',
        description: 'Пара кроксов. В реке? Почему нет.',
        rarity: Rarity.UNCOMMON,
        emoji: '👟',
        isFish: false,
        resistance: 0.07,
        price: 6
    },

    // Rare
    {
        id: 'golden_fish',
        name: 'Золотая рыбка',
        description: 'Исполнит три желания... или нет.',
        rarity: Rarity.RARE,
        emoji: '✨',
        isFish: true,
        weight: { min: 0.3, max: 1.0 },
        resistance: 0.55,
        price: 50
    },
    {
        id: 'sturgeon',
        name: 'Осётр',
        description: 'Благородная рыба. Большая удача!',
        rarity: Rarity.RARE,
        emoji: '🐋',
        isFish: true,
        weight: { min: 3.0, max: 10.0 },
        resistance: 0.6,
        price: 65
    },
    {
        id: 'chest',
        name: 'Сундук',
        description: 'Старый снаружи, пустой внутри.',
        rarity: Rarity.RARE,
        emoji: '📦',
        isFish: false,
        resistance: 0.3,
        price: 40
    },
    {
        id: 'salmon',
        name: 'Лосось',
        description: 'Красная рыба! Кто-нибудь будет суши?',
        rarity: Rarity.RARE,
        emoji: '🍣',
        isFish: true,
        weight: { min: 2.0, max: 7.0 },
        resistance: 0.55,
        price: 55
    },
    {
        id: 'sword',
        name: 'Ржавый меч',
        description: 'Экскалибур? Нет, просто ржавый меч.',
        rarity: Rarity.RARE,
        emoji: '⚔️',
        isFish: false,
        resistance: 0.25,
        price: 35
    },
    {
        id: 'axolotl',
        name: 'Аксолотль',
        description: 'AXOLOTL',
        rarity: Rarity.RARE,
        emoji: '🦎',
        isFish: true,
        weight: { min: 0.1, max: 0.3 },
        resistance: 0.3,
        price: 45
    },
    {
        id: 'electric_eel',
        name: 'Электрический угорь',
        description: 'Бьёт током! Осторожно!',
        rarity: Rarity.RARE,
        emoji: '⚡',
        isFish: true,
        weight: { min: 1.5, max: 5.0 },
        resistance: 0.65,
        price: 70
    },
    {
        id: 'key',
        name: 'Связка ключей',
        description: 'Ключи! Значит и подписки где-то рядом.',
        rarity: Rarity.RARE,
        emoji: '🔑',
        isFish: false,
        resistance: 0.65,
        price: 70
    },

    // Epic
    {
        id: 'giant_catfish',
        name: 'Гигантский сом',
        description: 'МОНСТР! Такого редко кто вытаскивал.',
        rarity: Rarity.EPIC,
        emoji: '🐳',
        isFish: true,
        weight: { min: 10.0, max: 30.0 },
        resistance: 0.75,
        price: 150
    },
    {
        id: 'artifact',
        name: 'Странный артефакт',
        description: 'Светится и гудит. Лучше не трогать...',
        rarity: Rarity.EPIC,
        emoji: '🔮',
        isFish: false,
        resistance: 0.4,
        price: 120
    },
    {
        id: 'megalodon_tooth',
        name: 'Зуб мегалодона',
        description: 'Ему миллионы лет. Остальной мегалодон где-то рядом?',
        rarity: Rarity.EPIC,
        emoji: '🦷',
        isFish: false,
        resistance: 0.35,
        price: 130
    },
    {
        id: 'swordfish',
        name: 'Рыба-меч',
        description: 'Носом может проткнуть лодку. Повезло, что не проткнула.',
        rarity: Rarity.EPIC,
        emoji: '🗡️',
        isFish: true,
        weight: { min: 15.0, max: 50.0 },
        resistance: 0.8,
        price: 200
    },
    {
        id: 'golden_toilet',
        name: 'Золотой унитаз',
        description: 'Кто-то сбросил улики. Весит тонну.',
        rarity: Rarity.EPIC,
        emoji: '🚽',
        isFish: false,
        resistance: 0.5,
        price: 180
    },
    {
        id: 'nemo',
        name: 'Немо',
        description: 'ЕГО НАКОНЕЦ НАШЛИ!',
        rarity: Rarity.EPIC,
        emoji: '🐠',
        isFish: true,
        weight: { min: 0.1, max: 0.5 },
        resistance: 0.6,
        price: 160
    },

    // Legendary
    {
        id: 'whale',
        name: 'Кит',
        description: 'Кит в реке?! Невероятно!',
        rarity: Rarity.LEGENDARY,
        emoji: '🐋',
        isFish: true,
        weight: { min: 100.0, max: 500.0 },
        resistance: 0.9,
        price: 500
    },
    {
        id: 'neptune_crown',
        name: 'Корона Нептуна',
        description: 'Легендарная корона повелителя морей.',
        rarity: Rarity.LEGENDARY,
        emoji: '👑',
        isFish: false,
        resistance: 0.5,
        price: 400
    },
    {
        id: 'diamond_fish',
        name: 'Алмазная рыба',
        description: 'Чешуя из чистых алмазов. Стоит как квартира в Москве.',
        rarity: Rarity.LEGENDARY,
        emoji: '💎',
        isFish: true,
        weight: { min: 0.5, max: 2.0 },
        resistance: 0.7,
        price: 350
    },
    {
        id: 'mass_backwards',
        name: 'Рыба наоборот',
        description: 'Плавает задом наперёд и думает, что так правильно.',
        rarity: Rarity.LEGENDARY,
        emoji: '🔄',
        isFish: true,
        weight: { min: 1.0, max: 3.0 },
        resistance: 0.75,
        price: 300
    },
    {
        id: 'flood',
        name: 'Картинка, на которой много воды',
        description:
            'Кажется, это затопленный город. Может, это отсылка на Библию?..',
        rarity: Rarity.LEGENDARY,
        emoji: '🌊',
        isFish: false,
        resistance: 0.75,
        price: 380
    },
    {
        id: 'fisherman_badge',
        name: 'Значок рыболова',
        description:
            'Награда для истинного мастера. Говорят, его невозможно вытащить...',
        rarity: Rarity.LEGENDARY,
        emoji: '🎖️',
        isFish: false,
        resistance: 0.95,
        price: 1000
    }
];

export const RARITY_WEIGHTS: Record<Rarity, number> = {
    [Rarity.COMMON]: 60,
    [Rarity.UNCOMMON]: 25,
    [Rarity.RARE]: 10,
    [Rarity.EPIC]: 4,
    [Rarity.LEGENDARY]: 1
};

export const DEFAULT_CONFIG: GameConfig = {
    waterLevelRatio: 0.55,
    gravity: 800,
    castChargeSpeed: 80,
    biteMinTime: 3,
    biteMaxTime: 10,
    biteReactTime: 2,
    reelSpeed: 25,
    tensionDecayRate: 30,
    tensionIncreaseRate: 40,
    fishResistanceInterval: 1.5
};

export const TOOLTIP_MESSAGES: Record<string, string> = {
    idle: 'Нажмите ПРОБЕЛ или ЛКМ для заброса',
    casting: 'Удерживайте для набора силы...',
    floating: 'Ждём поклёвки...',
    bite: '‼ КЛЮЁТ! Нажмите быстрее ‼',
    reeling: 'Удерживайте для подтяжки. Не перетяните леску!',
    caught: 'Отличный улов! Нажмите для продолжения',
    escaped: 'Сорвалась! Нажмите для продолжения'
};

export const ROD_UPGRADES: RodUpgrade[] = [
    {
        level: 0,
        name: 'Деревянная удочка',
        cost: 0,
        resistanceReduction: 0,
        rarityBoost: 0,
        description: 'Простая удочка из дерева. С чего-то надо начинать.'
    },
    {
        level: 1,
        name: 'Медная удочка',
        cost: 50,
        resistanceReduction: 0.05,
        rarityBoost: 0.15,
        description: 'Медный стержень гнётся, но не ломается.'
    },
    {
        level: 2,
        name: 'Железная удочка',
        cost: 150,
        resistanceReduction: 0.1,
        rarityBoost: 0.35,
        description: 'Крепкий железный стержень. Рыба чувствует силу.'
    },
    {
        level: 3,
        name: 'Золотая удочка',
        cost: 400,
        resistanceReduction: 0.18,
        rarityBoost: 0.6,
        description: 'Блестит на солнце. Редкая рыба сама плывёт к ней.'
    },
    {
        level: 4,
        name: 'Алмазная удочка',
        cost: 800,
        resistanceReduction: 0.25,
        rarityBoost: 1.0,
        description: 'Почти неразрушима. Сопротивление рыбы тает на глазах.'
    },
    {
        level: 5,
        name: 'Незеритовая удочка',
        cost: 1500,
        resistanceReduction: 0.35,
        rarityBoost: 1.5,
        description: 'Выкована в глубинах Нижнего мира. Абсолютная мощь.'
    }
];
