/**
 * economyEventsConfig.js
 * Quản lý cấu hình mặc định và lưu trữ/truy xuất cấu hình linh hoạt (JSON)
 * cho toàn bộ hệ thống Economy và Liveops Events trong Pixel Hunt / Hole Em All.
 * Tích hợp đầy đủ dữ liệu Remote Config Liveops Checkpoints từ game.
 */

import { LOCAL_LEVEL_CONFIG } from './levelConfig.js';

export const STORAGE_KEY_ECONOMY_CONFIG = "clever_carson_economy_config";

export const DEFAULT_ECONOMY_CONFIG = {
  "core": {
    "winLevelGold": [
      25,
      50,
      75
    ],
    "winLevelWatchAdsMulti": 2,
    "boosterPrices": [
      600,
      600,
      600,
      600,
      900
    ],
    "reviveCost": 900,
    "heartGoldPrice": 180,
    "heartMax": 5,
    "heartGainMinutes": 30
  },
  "boosterUnlocks": {
    "claw": 7,
    "hand": 13,
    "shuffle": 15,
    "superShooter": 18,
    "addTray": 1
  },
  "speedUp": {
    "levelUnlocked": 1,
    "newPlayerTimeMin": 20,
    "rewardAdsTimeMin": 3
  },
  "dailyFreeCoin": {
    "coinPerDay": 100,
    "videoCoinPerView": 250,
    "estimatedLevelsPerDay": 15
  },
  "weeklyChallenge": {
    "enabled": true,
    "levelUnlocked": 11,
    "cycleLevels": 20,
    "rewardsPerCycle": {
      "gold": 300,
      "heartMinutes": 30,
      "boosters": {
        "claw": 1,
        "hand": 1,
        "shuffle": 1,
        "superShooter": 1
      }
    }
  },
  "keyChallenge": {
    "enabled": true,
    "levelUnlocked": 40,
    "keyEachWin": 3,
    "keyExtraFirstWin": 1,
    "durationDays": 7,
    "rewards": [
      {
        "step": 1,
        "key": 3,
        "type": "Heart",
        "amount": 15,
        "name": "15m Unlimited Heart"
      },
      {
        "step": 2,
        "key": 6,
        "type": "Gold",
        "amount": 25,
        "name": "25 Gold"
      },
      {
        "step": 3,
        "key": 9,
        "type": "Booster",
        "boosterId": 2,
        "amount": 1,
        "name": "1 Shuffle Booster"
      },
      {
        "step": 4,
        "key": 12,
        "type": "Heart",
        "amount": 15,
        "name": "15m Unlimited Heart"
      },
      {
        "step": 5,
        "key": 18,
        "type": "Gold",
        "amount": 25,
        "name": "25 Gold"
      },
      {
        "step": 6,
        "key": 15,
        "type": "Booster",
        "boosterId": 0,
        "amount": 1,
        "name": "1 Claw Booster"
      },
      {
        "step": 7,
        "key": 21,
        "type": "Gold",
        "amount": 50,
        "name": "50 Gold"
      },
      {
        "step": 8,
        "key": 24,
        "type": "Heart",
        "amount": 30,
        "name": "30m Unlimited Heart"
      },
      {
        "step": 9,
        "key": 27,
        "type": "Gold",
        "amount": 50,
        "name": "50 Gold"
      },
      {
        "step": 10,
        "key": 33,
        "type": "Booster",
        "boosterId": 2,
        "amount": 1,
        "name": "1 Shuffle Booster"
      },
      {
        "step": 11,
        "key": 30,
        "type": "Heart",
        "amount": 30,
        "name": "30m Unlimited Heart"
      },
      {
        "step": 12,
        "key": 33,
        "type": "Gold",
        "amount": 75,
        "name": "75 Gold"
      },
      {
        "step": 13,
        "key": 33,
        "type": "Booster",
        "boosterId": 1,
        "amount": 1,
        "name": "1 Hand Booster"
      },
      {
        "step": 14,
        "key": 33,
        "type": "Gold",
        "amount": 75,
        "name": "75 Gold"
      },
      {
        "step": 15,
        "key": 33,
        "type": "Heart",
        "amount": 45,
        "name": "45m Unlimited Heart"
      },
      {
        "step": 16,
        "key": 33,
        "type": "Booster",
        "boosterId": 3,
        "amount": 1,
        "name": "1 Super Shooter"
      },
      {
        "step": 17,
        "key": 33,
        "type": "Gold",
        "amount": 100,
        "name": "100 Gold"
      },
      {
        "step": 18,
        "key": 33,
        "type": "Heart",
        "amount": 60,
        "name": "60m Unlimited Heart"
      },
      {
        "step": 19,
        "key": 33,
        "type": "Booster",
        "boosterId": 1,
        "amount": 1,
        "name": "1 Hand Booster"
      },
      {
        "step": 20,
        "key": 33,
        "type": "Booster",
        "boosterId": 0,
        "amount": 1,
        "name": "1 Claw Booster"
      },
      {
        "step": 21,
        "key": 33,
        "type": "Booster",
        "boosterId": 3,
        "amount": 1,
        "name": "1 Super Shooter"
      },
      {
        "step": 22,
        "key": 33,
        "type": "Heart",
        "amount": 120,
        "name": "120m Unlimited Heart"
      },
      {
        "step": 23,
        "key": 33,
        "type": "Gold",
        "amount": 150,
        "name": "150 Gold"
      },
      {
        "step": 24,
        "key": 33,
        "type": "Booster",
        "boosterId": 0,
        "amount": 1,
        "name": "1 Claw Booster"
      },
      {
        "step": 25,
        "key": 33,
        "type": "Booster",
        "boosterId": 2,
        "amount": 1,
        "name": "1 Shuffle Booster"
      },
      {
        "step": 26,
        "key": 33,
        "type": "Gold",
        "amount": 200,
        "name": "200 Gold"
      },
      {
        "step": 27,
        "key": 33,
        "type": "Booster",
        "boosterId": 1,
        "amount": 1,
        "name": "1 Hand Booster"
      },
      {
        "step": 28,
        "key": 33,
        "type": "Booster",
        "boosterId": 3,
        "amount": 1,
        "name": "1 Super Shooter"
      },
      {
        "step": 29,
        "key": 33,
        "type": "Heart",
        "amount": 180,
        "name": "180m Unlimited Heart"
      },
      {
        "step": 30,
        "key": 33,
        "type": "Gold",
        "amount": 1000,
        "name": "1,000 Gold Jackpot"
      }
    ]
  },
  "treasureCave": {
    "enabled": true,
    "levelUnlocked": 67,
    "maxStreak": 7,
    "totalCoinReward": 1000,
    "expectedWinReward": 180,
    "reviveCost": 900
  },
  "adventureRush": {
    "enabled": true,
    "levelUnlocked": 20,
    "collectRatePerLevel": 15,
    "data": {
      "startDate": "2026-07-18",
      "enable": true,
      "loop": {
        "type": "day",
        "value": 7,
        "delay": 0
      },
      "Objects": [
        1,
        2,
        3,
        4,
        5
      ],
      "Checkpoints": [
        {
          "name": 1,
          "mission": 3,
          "reward": 15,
          "type": "HeartTime"
        },
        {
          "name": 2,
          "mission": 10,
          "reward": 200,
          "type": "Coin"
        },
        {
          "name": 3,
          "mission": 25,
          "reward": 15,
          "type": "LightningTime"
        },
        {
          "name": 4,
          "mission": 10,
          "reward": 1,
          "type": "Growth"
        },
        {
          "name": 5,
          "mission": 25,
          "reward": 1,
          "type": "Freeze"
        },
        {
          "name": 6,
          "mission": 35,
          "reward": 1,
          "type": "ExtraT"
        },
        {
          "name": 7,
          "mission": 40,
          "reward": 1,
          "type": "Compass"
        },
        {
          "name": 8,
          "mission": 65,
          "reward": 400,
          "type": "Coin"
        },
        {
          "name": 9,
          "mission": 35,
          "reward": 30,
          "type": "HeartTime"
        },
        {
          "name": 10,
          "mission": 60,
          "reward": 15,
          "type": "OTime"
        },
        {
          "name": 11,
          "mission": 25,
          "reward": 10,
          "type": "ExtraTTime"
        },
        {
          "name": 12,
          "mission": 45,
          "reward": 2,
          "type": "Lightning"
        },
        {
          "name": 13,
          "mission": 75,
          "reward": 1,
          "type": "Growth"
        },
        {
          "name": 14,
          "mission": 35,
          "reward": 15,
          "type": "OTime"
        },
        {
          "name": 15,
          "mission": 85,
          "reward": 1000,
          "type": "Coin"
        },
        {
          "name": 16,
          "mission": 65,
          "reward": 1,
          "type": "Compass"
        },
        {
          "name": 17,
          "mission": 35,
          "reward": 30,
          "type": "HeartTime"
        },
        {
          "name": 18,
          "mission": 65,
          "reward": 300,
          "type": "Coin"
        },
        {
          "name": 19,
          "mission": 45,
          "reward": 1,
          "type": "Growth"
        },
        {
          "name": 20,
          "mission": 70,
          "reward": 1,
          "type": "Freeze"
        },
        {
          "name": 21,
          "mission": 90,
          "reward": 15,
          "type": "HeartTime"
        },
        {
          "name": 22,
          "mission": 45,
          "reward": 1,
          "type": "Magnet"
        },
        {
          "name": 23,
          "mission": 65,
          "reward": 2,
          "type": "ExtraT"
        },
        {
          "name": 24,
          "mission": 100,
          "reward": 20,
          "type": "LightningTime"
        },
        {
          "name": 25,
          "mission": 45,
          "reward": 300,
          "type": "Coin"
        },
        {
          "name": 26,
          "mission": 90,
          "reward": 30,
          "type": "ExtraTTime"
        },
        {
          "name": 27,
          "mission": 140,
          "reward": 2,
          "type": "Growth"
        },
        {
          "name": 28,
          "mission": 45,
          "reward": 60,
          "type": "HeartTime"
        },
        {
          "name": 29,
          "mission": 150,
          "reward": 30,
          "type": "OTime"
        },
        {
          "name": 30,
          "mission": 200,
          "reward": 10000,
          "type": "Coin"
        }
      ]
    }
  },
  "bearPass": {
    "enabled": true,
    "levelUnlocked": 36,
    "data": {
      "startDate": "2025-01-01",
      "loop": {
        "type": "month",
        "delay": 0,
        "value": 1
      },
      "enable": true,
      "levelRequired": 36,
      "checkpoints": [
        {
          "checkpoint": {
            "missions": [
              "L,0"
            ],
            "freeUnified": [
              {
                "id": "Magnet",
                "type": "booster",
                "count": 1
              }
            ],
            "vipUnified": [
              {
                "id": "MPVip0",
                "count": 0
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,1"
            ],
            "freeUnified": [
              {
                "id": "Compass",
                "type": "booster",
                "count": 1
              }
            ],
            "vipUnified": [
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 15
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,3"
            ],
            "freeUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 50
              }
            ],
            "vipUnified": [
              {
                "id": "Freeze",
                "type": "booster",
                "count": 1
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,3"
            ],
            "freeUnified": [
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              }
            ],
            "vipUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 300
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,5"
            ],
            "freeUnified": [
              {
                "id": "Growth",
                "type": "booster",
                "count": 1
              }
            ],
            "vipUnified": [
              {
                "id": "ExtraTime",
                "type": "timeBooster",
                "count": 10
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,10"
            ],
            "freeUnified": [
              {
                "id": "Freeze",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Coin",
                "type": "currency",
                "count": 100
              }
            ],
            "vipUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 400
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,8"
            ],
            "freeUnified": [
              {
                "id": "ExtraTime",
                "type": "timeBooster",
                "count": 10
              }
            ],
            "vipUnified": [
              {
                "id": "Heart",
                "type": "timeCurrency",
                "count": 30
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,10"
            ],
            "freeUnified": [
              {
                "id": "Freeze",
                "type": "booster",
                "count": 1
              }
            ],
            "vipUnified": [
              {
                "id": "Compass",
                "type": "booster",
                "count": 2
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,15"
            ],
            "freeUnified": [
              {
                "id": "Growth",
                "type": "booster",
                "count": 1
              }
            ],
            "vipUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 200
              },
              {
                "id": "ExtraTime",
                "type": "timeBooster",
                "count": 10
              },
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,20"
            ],
            "freeUnified": [
              {
                "id": "Heart",
                "type": "timeCurrency",
                "count": 15
              }
            ],
            "vipUnified": [
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,30"
            ],
            "freeUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 200
              },
              {
                "id": "Compass",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              }
            ],
            "vipUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 1000
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,25"
            ],
            "freeUnified": [
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              }
            ],
            "vipUnified": [
              {
                "id": "Growth",
                "type": "booster",
                "count": 2
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,35"
            ],
            "freeUnified": [
              {
                "id": "Magnet",
                "type": "booster",
                "count": 1
              }
            ],
            "vipUnified": [
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,30"
            ],
            "freeUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 500
              }
            ],
            "vipUnified": [
              {
                "id": "Freeze",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Compass",
                "type": "booster",
                "count": 2
              },
              {
                "id": "Coin",
                "type": "currency",
                "count": 500
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,35"
            ],
            "freeUnified": [
              {
                "id": "Growth",
                "type": "booster",
                "count": 1
              }
            ],
            "vipUnified": [
              {
                "id": "Heart",
                "type": "timeCurrency",
                "count": 30
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,45"
            ],
            "freeUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 400
              },
              {
                "id": "ExtraTime",
                "type": "timeBooster",
                "count": 10
              },
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              }
            ],
            "vipUnified": [
              {
                "id": "Freeze",
                "type": "booster",
                "count": 2
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,35"
            ],
            "freeUnified": [
              {
                "id": "Compass",
                "type": "booster",
                "count": 1
              }
            ],
            "vipUnified": [
              {
                "id": "Magnet",
                "type": "booster",
                "count": 1
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,40"
            ],
            "freeUnified": [
              {
                "id": "ExtraTime",
                "type": "timeBooster",
                "count": 10
              }
            ],
            "vipUnified": [
              {
                "id": "Growth",
                "type": "booster",
                "count": 2
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,40"
            ],
            "freeUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 400
              }
            ],
            "vipUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 500
              },
              {
                "id": "ExtraTime",
                "type": "timeBooster",
                "count": 10
              },
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,45"
            ],
            "freeUnified": [
              {
                "id": "Heart",
                "type": "timeCurrency",
                "count": 30
              }
            ],
            "vipUnified": [
              {
                "id": "Growth",
                "type": "booster",
                "count": 2
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,55"
            ],
            "freeUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 500
              },
              {
                "id": "Magnet",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Compass",
                "type": "booster",
                "count": 1
              }
            ],
            "vipUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 1000
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,43"
            ],
            "freeUnified": [
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              }
            ],
            "vipUnified": [
              {
                "id": "Heart",
                "type": "timeCurrency",
                "count": 30
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,45"
            ],
            "freeUnified": [
              {
                "id": "Growth",
                "type": "booster",
                "count": 1
              }
            ],
            "vipUnified": [
              {
                "id": "Compass",
                "type": "booster",
                "count": 2
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,50"
            ],
            "freeUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 500
              }
            ],
            "vipUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 800
              },
              {
                "id": "Compass",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Freeze",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Magnet",
                "type": "booster",
                "count": 1
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,55"
            ],
            "freeUnified": [
              {
                "id": "Freeze",
                "type": "booster",
                "count": 1
              }
            ],
            "vipUnified": [
              {
                "id": "ExtraTime",
                "type": "timeBooster",
                "count": 10
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,70"
            ],
            "freeUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 800
              },
              {
                "id": "Heart",
                "type": "timeCurrency",
                "count": 30
              },
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              }
            ],
            "vipUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 1500
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,55"
            ],
            "freeUnified": [
              {
                "id": "ExtraTime",
                "type": "timeBooster",
                "count": 10
              }
            ],
            "vipUnified": [
              {
                "id": "Magnet",
                "type": "booster",
                "count": 1
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,75"
            ],
            "freeUnified": [
              {
                "id": "Compass",
                "type": "booster",
                "count": 2
              }
            ],
            "vipUnified": [
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,65"
            ],
            "freeUnified": [
              {
                "id": "Magnet",
                "type": "booster",
                "count": 1
              }
            ],
            "vipUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 1000
              },
              {
                "id": "Heart",
                "type": "timeCurrency",
                "count": 30
              },
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              },
              {
                "id": "ExtraTime",
                "type": "timeBooster",
                "count": 10
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,80"
            ],
            "freeUnified": [
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              }
            ],
            "vipUnified": [
              {
                "id": "Growth",
                "type": "booster",
                "count": 3
              }
            ]
          }
        },
        {
          "checkpoint": {
            "missions": [
              "L,120"
            ],
            "freeUnified": [
              {
                "id": "Growth",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Magnet",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Freeze",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Compass",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              },
              {
                "id": "ExtraTime",
                "type": "timeBooster",
                "count": 10
              }
            ],
            "vipUnified": [
              {
                "id": "Coin",
                "type": "currency",
                "count": 2000
              },
              {
                "id": "Growth",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Magnet",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Freeze",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Compass",
                "type": "booster",
                "count": 1
              },
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              },
              {
                "id": "ExtraTime",
                "type": "timeBooster",
                "count": 10
              },
              {
                "id": "Lightning",
                "type": "timeBooster",
                "count": 20
              },
              {
                "id": "ExtraTime",
                "type": "timeBooster",
                "count": 10
              }
            ]
          }
        }
      ]
    }
  },
  "dragonTreasure": {
    "enabled": true,
    "levelUnlocked": 61,
    "data": {
      "startDate": "2026-05-29",
      "enable": true,
      "loop": {
        "type": "day",
        "value": 1,
        "delay": 6
      },
      "LevelUnlock": 61,
      "MatchPlayTime": 60,
      "Cooldown_time": 60,
      "Reward": 10000,
      "PBase": 1e-06,
      "PGrowth": 1e-05,
      "MinTargetBots": 1,
      "MaxTargetBots": 14,
      "TargetBotsWeights": [
        5,
        5,
        5,
        5,
        30,
        30,
        30,
        30,
        30,
        100,
        100,
        100,
        100,
        100
      ]
    }
  },
  "magicCrafting": {
    "enabled": true,
    "levelUnlocked": 81,
    "data": {
      "startDate": "2025-12-24",
      "enable": true,
      "loop": {
        "type": "day",
        "value": 4,
        "delay": 3
      },
      "levelRequired": 81,
      "adEnable": false,
      "stages": [
        {
          "stageOrder": 1,
          "totalType": 3,
          "rewardList": [
            {
              "name": "HeartTime",
              "amount": 10
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 2,
          "totalType": 3,
          "rewardList": [
            {
              "name": "Compass",
              "amount": 1
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 3,
          "totalType": 3,
          "rewardList": [
            {
              "name": "LightningTime",
              "amount": 10
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 4,
          "totalType": 4,
          "rewardList": [
            {
              "name": "Coin",
              "amount": 200
            },
            {
              "name": "ExtraTTime",
              "amount": 10
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 5,
          "totalType": 4,
          "rewardList": [
            {
              "name": "Growth",
              "amount": 1
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 6,
          "totalType": 4,
          "rewardList": [
            {
              "name": "Lightning",
              "amount": 1
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 7,
          "totalType": 5,
          "rewardList": [
            {
              "name": "Compass",
              "amount": 1
            },
            {
              "name": "Freeze",
              "amount": 1
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 8,
          "totalType": 5,
          "rewardList": [
            {
              "name": "LightningTime",
              "amount": 10
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 9,
          "totalType": 5,
          "rewardList": [
            {
              "name": "HeartTime",
              "amount": 20
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 10,
          "totalType": 6,
          "rewardList": [
            {
              "name": "Growth",
              "amount": 1
            },
            {
              "name": "Lightning",
              "amount": 1
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 11,
          "totalType": 6,
          "rewardList": [
            {
              "name": "Coin",
              "amount": 1000
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 12,
          "totalType": 6,
          "rewardList": [
            {
              "name": "HeartTime",
              "amount": 30
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 13,
          "totalType": 6,
          "rewardList": [
            {
              "name": "Freeze",
              "amount": 1
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 14,
          "totalType": 6,
          "rewardList": [
            {
              "name": "ExtraTTime",
              "amount": 30
            }
          ],
          "replaceReward": -1
        },
        {
          "stageOrder": 15,
          "totalType": 6,
          "rewardList": [
            {
              "name": "Coin",
              "amount": 5000
            }
          ],
          "replaceReward": -1
        }
      ],
      "bigReward": [
        {
          "name": "Growth",
          "amount": 1
        },
        {
          "name": "Magnet",
          "amount": 1
        },
        {
          "name": "Compass",
          "amount": 1
        },
        {
          "name": "Freeze",
          "amount": 1
        },
        {
          "name": "Lightning",
          "amount": 1
        },
        {
          "name": "ExtraT",
          "amount": 1
        }
      ],
      "listReplaceReward": [
        {
          "replaceReward": "collect-1",
          "eventType": "collectobject",
          "rewardList": [
            {
              "name": "Coin",
              "amount": 20
            }
          ]
        },
        {
          "replaceReward": "collect-2",
          "eventType": "collectobject",
          "rewardList": [
            {
              "name": "Coin",
              "amount": 10
            }
          ]
        },
        {
          "replaceReward": "mission-1",
          "eventType": "missionpass",
          "rewardList": [
            {
              "name": "Coin",
              "amount": 30
            }
          ]
        }
      ]
    }
  },
  "cloudQuest": {
    "enabled": true,
    "levelUnlocked": 101,
    "data": {
      "startDate": "2025-12-19",
      "loop": {
        "type": "day",
        "delay": 4,
        "value": 3
      },
      "enable": false,
      "levelToShow": 101,
      "lives": 3,
      "resetType": "checkpoint",
      "checkpoints": [
        {
          "winStreakCount": 2,
          "rewards": [
            {
              "amount": 15,
              "type": "HeartTime"
            }
          ]
        },
        {
          "winStreakCount": 3,
          "rewards": [
            {
              "amount": 15,
              "type": "LightningTime"
            },
            {
              "amount": 1,
              "type": "Freeze"
            }
          ]
        },
        {
          "winStreakCount": 3,
          "rewards": [
            {
              "amount": 1,
              "type": "Compass"
            },
            {
              "amount": 100,
              "type": "Coin"
            }
          ]
        },
        {
          "winStreakCount": 4,
          "rewards": [
            {
              "amount": 15,
              "type": "ExtraTTime"
            },
            {
              "amount": 1,
              "type": "Growth"
            }
          ]
        },
        {
          "winStreakCount": 4,
          "rewards": [
            {
              "amount": 200,
              "type": "Coin"
            },
            {
              "amount": 1,
              "type": "Magnet"
            },
            {
              "amount": 1,
              "type": "Freeze"
            }
          ]
        },
        {
          "winStreakCount": 5,
          "rewards": [
            {
              "amount": 30,
              "type": "HeartTime"
            },
            {
              "amount": 15,
              "type": "LightningTime"
            },
            {
              "amount": 1,
              "type": "Growth"
            }
          ]
        },
        {
          "winStreakCount": 5,
          "rewards": [
            {
              "amount": 500,
              "type": "Coin"
            },
            {
              "amount": 1,
              "type": "Compass"
            },
            {
              "amount": 1,
              "type": "Freeze"
            }
          ]
        },
        {
          "winStreakCount": 6,
          "rewards": [
            {
              "amount": 1,
              "type": "Lightning"
            },
            {
              "amount": 1,
              "type": "Magnet"
            },
            {
              "amount": 15,
              "type": "ExtraTTime"
            }
          ]
        },
        {
          "winStreakCount": 7,
          "rewards": [
            {
              "amount": 30,
              "type": "HeartTime"
            },
            {
              "amount": 1,
              "type": "ExtraT"
            },
            {
              "amount": 1,
              "type": "Freeze"
            },
            {
              "amount": 1,
              "type": "Growth"
            }
          ]
        },
        {
          "winStreakCount": 10,
          "rewards": [
            {
              "amount": 1000,
              "type": "Coin"
            },
            {
              "amount": 60,
              "type": "HeartTime"
            },
            {
              "amount": 1,
              "type": "Compass"
            },
            {
              "amount": 1,
              "type": "Magnet"
            },
            {
              "amount": 1,
              "type": "Freeze"
            },
            {
              "amount": 1,
              "type": "Lightning"
            },
            {
              "amount": 1,
              "type": "ExtraT"
            },
            {
              "amount": 1,
              "type": "Growth"
            }
          ]
        }
      ],
      "winstreak_adjustment": [
        {
          "difficulty_name": "easy",
          "required_winstreak_adjustment": -10,
          "effective_range": [
            0,
            30
          ]
        },
        {
          "difficulty_name": "normal",
          "required_winstreak_adjustment": 0,
          "effective_range": [
            31,
            79
          ]
        },
        {
          "difficulty_name": "hard",
          "required_winstreak_adjustment": 10,
          "effective_range": [
            80,
            100
          ]
        }
      ]
    }
  },
  "grandHunt": {
    "enabled": true,
    "levelUnlocked": 121,
    "data": {
      "startDate": "2025-12-17",
      "enable": true,
      "loop": {
        "type": "day",
        "value": 1,
        "delay": 0
      },
      "levelToShow": 121,
      "loopEnable": false,
      "stageConfig": [
        {
          "rewardList": [
            {
              "name": "Coin",
              "amount": 100
            },
            {
              "name": "HeartTime",
              "amount": 30
            }
          ],
          "aiPlayerList": [
            0,
            1,
            2,
            3
          ],
          "numOfStepToFinish": 7
        },
        {
          "rewardList": [
            {
              "name": "Coin",
              "amount": 300
            },
            {
              "name": "LightningTime",
              "amount": 15
            }
          ],
          "aiPlayerList": [
            4,
            5,
            6
          ],
          "numOfStepToFinish": 12
        },
        {
          "rewardList": [
            {
              "name": "Coin",
              "amount": 500
            },
            {
              "name": "Growth",
              "amount": 1
            },
            {
              "name": "Magnet",
              "amount": 1
            },
            {
              "name": "Freeze",
              "amount": 1
            },
            {
              "name": "Compass",
              "amount": 1
            }
          ],
          "aiPlayerList": [
            7,
            8
          ],
          "numOfStepToFinish": 17
        }
      ],
      "aiConfig": [
        {
          "aiNum": 0,
          "winRate": 0.4,
          "minCompletePerRound": 34.28
        },
        {
          "aiNum": 1,
          "winRate": 0.6,
          "minCompletePerRound": 21.43
        },
        {
          "aiNum": 2,
          "winRate": 0.85,
          "minCompletePerRound": 12.86
        },
        {
          "aiNum": 3,
          "winRate": 1,
          "minCompletePerRound": 8.57
        },
        {
          "aiNum": 4,
          "winRate": 0.55,
          "minCompletePerRound": 18.75
        },
        {
          "aiNum": 5,
          "winRate": 0.8,
          "minCompletePerRound": 11.25
        },
        {
          "aiNum": 6,
          "winRate": 1,
          "minCompletePerRound": 7.5
        },
        {
          "aiNum": 7,
          "winRate": 0.75,
          "minCompletePerRound": 10.59
        },
        {
          "aiNum": 8,
          "winRate": 1,
          "minCompletePerRound": 7.06
        }
      ]
    }
  },
  "missionControl": {
    "enabled": true,
    "levelUnlocked": 131,
    "data": {
      "startDate": "2026-08-21",
      "enable": true,
      "loop": {
        "type": "day",
        "value": 3,
        "delay": 11
      },
      "unlock_level": 131,
      "taskUIDs": [
        "lv_all_win",
        "element_hunt_collect",
        "cloud_quest_complete",
        "star_collect"
      ],
      "stage_chest": [
        {
          "stage": 1,
          "rewards": [
            {
              "id": "Heart",
              "type": "timeCurrency",
              "count": 30
            },
            {
              "id": "Growth",
              "type": "booster",
              "count": 1
            }
          ]
        },
        {
          "stage": 2,
          "rewards": [
            {
              "id": "Coin",
              "type": "currency",
              "count": 100
            },
            {
              "id": "Compass",
              "type": "booster",
              "count": 1
            },
            {
              "id": "Lightning",
              "type": "timeBooster",
              "count": 20
            }
          ]
        },
        {
          "stage": 3,
          "rewards": [
            {
              "id": "Coin",
              "type": "currency",
              "count": 200
            },
            {
              "id": "Freeze",
              "type": "booster",
              "count": 1
            }
          ]
        },
        {
          "stage": 4,
          "rewards": [
            {
              "id": "Coin",
              "type": "currency",
              "count": 300
            },
            {
              "id": "Magnet",
              "type": "booster",
              "count": 1
            },
            {
              "id": "Lightning",
              "type": "timeBooster",
              "count": 20
            },
            {
              "id": "Heart",
              "type": "timeCurrency",
              "count": 60
            }
          ]
        }
      ],
      "final_chest": {
        "rewards": [
          {
            "id": "Coin",
            "type": "currency",
            "count": 500
          },
          {
            "id": "Growth",
            "type": "booster",
            "count": 1
          },
          {
            "id": "Compass",
            "type": "booster",
            "count": 1
          },
          {
            "id": "Magnet",
            "type": "booster",
            "count": 1
          },
          {
            "id": "Freeze",
            "type": "booster",
            "count": 1
          },
          {
            "id": "Lightning",
            "type": "timeBooster",
            "count": 20
          }
        ]
      },
      "ultimate_chest": {
        "enable": false,
        "rewards": [
          {
            "id": "Coin",
            "type": "currency",
            "count": 1500
          },
          {
            "id": "Heart",
            "type": "timeCurrency",
            "count": 90
          },
          {
            "id": "Lightning",
            "type": "timeBooster",
            "count": 30
          }
        ]
      }
    }
  },
  "difficultyLevels": {
    "hard": LOCAL_LEVEL_CONFIG.LevelHards,
    "superHard": LOCAL_LEVEL_CONFIG.LevelSuperHards
  }
};

export function loadEconomyConfig() {
  try {
    if (typeof localStorage === "undefined") return JSON.parse(JSON.stringify(DEFAULT_ECONOMY_CONFIG));
    const raw = localStorage.getItem(STORAGE_KEY_ECONOMY_CONFIG);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_ECONOMY_CONFIG));
    const parsed = JSON.parse(raw);
    const config = { ...DEFAULT_ECONOMY_CONFIG, ...parsed };
    // Luôn đồng bộ difficultyLevels theo chuẩn mới nhất từ LOCAL_LEVEL_CONFIG
    config.difficultyLevels = {
      hard: [...LOCAL_LEVEL_CONFIG.LevelHards],
      superHard: [...LOCAL_LEVEL_CONFIG.LevelSuperHards]
    };
    return config;
  } catch (e) {
    console.warn("[EconomyConfig] Lỗi parse config từ localStorage, dùng default:", e);
    return JSON.parse(JSON.stringify(DEFAULT_ECONOMY_CONFIG));
  }
}

export function saveEconomyConfig(config) {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.setItem(STORAGE_KEY_ECONOMY_CONFIG, JSON.stringify(config, null, 2));
    return true;
  } catch (e) {
    console.error("[EconomyConfig] Lỗi lưu config:", e);
    return false;
  }
}

export function resetEconomyConfig() {
  if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY_ECONOMY_CONFIG);
  return JSON.parse(JSON.stringify(DEFAULT_ECONOMY_CONFIG));
}
