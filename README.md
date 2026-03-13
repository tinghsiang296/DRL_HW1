# 🤖 GridWorld Value Iteration Dashboard

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Framework-Flask-lightgrey.svg)](https://flask.palletsprojects.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Render](https://img.shields.io/badge/Deployment-Render-brightgreen.svg)](https://render.com/)

> **線上展示網址：** https://drl-hw1-uago.onrender.com/

---

## 📖 專案概述 (Overview)

本專案實作了一個互動式的 **GridWorld** 環境，專為強化學習中的 **馬可夫決策過程 (MDP)** 視覺化而設計。透過 Flask 後端運算與現代化的前端介面，使用者可以即時觀察 **策略評估 (Policy Evaluation)** 與 **價值疊代 (Value Iteration)** 演算法的收斂過程。

這不僅是一個學術作業的實作，更是一個將複雜的強化學習理論轉化為直覺視覺回饋的工具。

## ✨ 核心特色 (Key Features)

- 🎨 **現代化視覺設計：** 採用 **Glassmorphism (玻璃擬態)** 風格，結合霓虹發光路徑與平滑動畫。
- 🖱️ **高度互動性：** - 動態調整網格大小 ($5 \times 5$ 至 $9 \times 9$)。
  - 滑鼠點擊即可佈置起點 (Robot)、終點 (Goal) 與障礙物。
- 🧠 **演算法視覺化：**
  - **策略評估：** 顯示隨機策略下的狀態價值流動。
  - **價值疊代：** 以 $\gamma = 0.9$ 計算最優價值函數 $V^*(s)$，並顯示最佳策略箭頭 $\pi^*$。
- 📱 **響應式佈局：** 適配不同螢幕尺寸，保持清晰的圖表呈現。

## 🛠️ 技術棧 (Tech Stack)

- **Backend:** Python 3.11 / Flask
- **Frontend:** HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript
- **Deployment:** Render (PaaS)
- **Environment:** Gunicorn (Production WSGI)



