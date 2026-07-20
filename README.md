# ⚽ Fantamondiali 2026

![Live Status](https://img.shields.io/badge/Status-Live_in_Production-success)
![Users](https://img.shields.io/badge/Active_Users-~50-blue)

A responsive, full-stack web application designed to synchronize, manage, and display live sports metadata. Transitioned from a local prototype to a live production environment, currently supporting an active user base of approximately 50 players.

## 📸 App Preview

Here is a look at the platform in action, showcasing the data-dense tablet dashboard alongside the mobile-responsive prediction input flow.

<p align="center">
  <img src="https://github.com/user-attachments/assets/ccac79e2-c77d-4806-9b9d-0f7b4886da58" alt="Tablet Dashboard View" width="550" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://github.com/user-attachments/assets/4afb1429-d036-4bb7-938b-2ac5d2adcbb9" alt="Mobile Prediction Insertion" width="250" />
</p>

## ⚙️ Core Architecture & Engineering Highlights

This project serves as a comprehensive playground for modern backend architectures and production-grade workflows:

*   **Serverless Backend:** Built upon **Supabase**, utilizing **Deno Edge Functions** to handle complex backend logic and user requests efficiently without maintaining a dedicated server.
*   **Database Management & SQL:** Engineered robust relational database structures. Optimized data integrity through complex **PostgreSQL** update statements and precise relational mapping logic.
*   **Automated Workflows:** Configured automated **Cron Jobs** to ensure timely data synchronization and updates.
*   **Version Control & Deployment:** Orchestrated deployment workflows using Git. Maintained isolated branches for testing and staging before merging and shipping new features reliably to the live production environment.
*   **User Experience (UX):** Focused on a mobile-responsive, data-dense UI layout capable of handling live updates while maintaining a seamless experience for end-users.

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript
*   **Backend / BaaS:** Supabase, Deno (Edge Functions)
*   **Database:** PostgreSQL

## 💡 Lessons Learned in Production

Managing a live application with real users introduced challenges beyond writing code. It required active monitoring, rapid debugging of live issues, and iterating on the UX based on direct customer feedback.
