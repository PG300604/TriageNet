from manim import *
import os
import subprocess

config.pixel_width = 1280
config.pixel_height = 720
config.frame_rate = 30
config.background_color = "#08090d"

# -------------------------------------------------------------------------
# 1. DEPLOYMENT & DOCKER / REDIS ARCHITECTURE
# -------------------------------------------------------------------------
class DeploymentDockerRedisScene(Scene):
    def construct(self):
        title = Text("TriageNet - Docker Multi-Container & Redis Telemetry Architecture", font="sans-serif", font_size=24, weight=BOLD)
        title.set_color_by_gradient("#ffffff", "#38bdf8")
        title.to_edge(UP, buff=0.35)
        self.play(FadeIn(title, shift=DOWN*0.2), run_time=0.6)

        # Outer Docker Host Box
        docker_host = RoundedRectangle(corner_radius=0.2, width=13.0, height=5.5, color="#2496ed", fill_color="#0a101d", fill_opacity=0.9, stroke_width=2.5)
        docker_host.shift(DOWN * 0.35)
        dh_label = Text("Docker Host Engine (docker-compose.prod.yml) · Isolated Bridge Network", font="sans-serif", font_size=13, color="#2496ed", weight=BOLD)
        dh_label.next_to(docker_host.get_top(), DOWN, buff=0.2)
        self.play(FadeIn(docker_host), FadeIn(dh_label), run_time=0.6)

        # 1. Nginx Reverse Proxy
        nginx_box = RoundedRectangle(corner_radius=0.15, width=2.4, height=4.0, color="#009639", fill_color="#10231b", fill_opacity=0.9)
        nginx_box.shift(LEFT * 4.8 + DOWN * 0.5)
        n_lbl = Text("Nginx Gateway\n(:80 / :443)", font="sans-serif", font_size=13, weight=BOLD, color="#009639").next_to(nginx_box.get_top(), DOWN, buff=0.2)
        n_sub1 = Text("SSL / TLS\nRate Limiting\nGzip Level 6\nKeepalive: 32", font="sans-serif", font_size=10, color="#cbd5e1").next_to(n_lbl, DOWN, buff=0.2)
        nginx_group = VGroup(nginx_box, n_lbl, n_sub1)

        # 2. Frontend Next.js
        front_box = RoundedRectangle(corner_radius=0.15, width=2.6, height=1.8, color="#ffffff", fill_color="#182234", fill_opacity=0.9)
        front_box.shift(LEFT * 1.5 + UP * 0.6)
        f_lbl = Text("Next.js 16 Frontend\n(Port 3000)", font="sans-serif", font_size=12, weight=BOLD, color=WHITE).next_to(front_box.get_top(), DOWN, buff=0.15)
        f_sub = Text("React 19 SSR · Turbopack\nLeaflet GIS 3D Maps", font="sans-serif", font_size=9, color="#94a3b8").next_to(f_lbl, DOWN, buff=0.1)
        front_group = VGroup(front_box, f_lbl, f_sub)

        # 3. Backend Spring Boot Core
        back_box = RoundedRectangle(corner_radius=0.15, width=2.6, height=1.8, color="#6db33f", fill_color="#182234", fill_opacity=0.9)
        back_box.shift(LEFT * 1.5 + DOWN * 1.6)
        b_lbl = Text("Spring Boot 3.3.13\n(Port 8080)", font="sans-serif", font_size=12, weight=BOLD, color="#6db33f").next_to(back_box.get_top(), DOWN, buff=0.15)
        b_sub = Text("Java 17 / Virtual Threads\nREST + Security RBAC", font="sans-serif", font_size=9, color="#94a3b8").next_to(b_lbl, DOWN, buff=0.1)
        back_group = VGroup(back_box, b_lbl, b_sub)

        # 4. Redis 7.2 Container (Hero Feature)
        redis_box = RoundedRectangle(corner_radius=0.15, width=3.0, height=2.0, color="#dc382d", fill_color="#2b1517", fill_opacity=0.95, stroke_width=3)
        redis_box.shift(RIGHT * 2.2 + UP * 0.6)
        r_lbl = Text("Redis 7.2 In-Memory Broker\n(Port 6379)", font="sans-serif", font_size=12, weight=BOLD, color="#ef4444").next_to(redis_box.get_top(), DOWN, buff=0.15)
        r_sub = Text("• Sub-50ms GPS Pub/Sub\n• STOMP WebSocket Relay\n• Bed Reservation TTL\n• AOF Persistence", font="sans-serif", font_size=9, color="#fca5a5").next_to(r_lbl, DOWN, buff=0.1)
        redis_group = VGroup(redis_box, r_lbl, r_sub)

        # 5. PostgreSQL 16 + PostGIS
        pg_box = RoundedRectangle(corner_radius=0.15, width=3.0, height=1.8, color="#336791", fill_color="#132338", fill_opacity=0.9)
        pg_box.shift(RIGHT * 2.2 + DOWN * 1.6)
        p_lbl = Text("PostgreSQL 16 + PostGIS\n(Port 5432)", font="sans-serif", font_size=12, weight=BOLD, color="#38bdf8").next_to(pg_box.get_top(), DOWN, buff=0.15)
        p_sub = Text("Row-Level Security (RLS)\nSpatial Road GIS Matrix\nACID Relational Store", font="sans-serif", font_size=9, color="#94a3b8").next_to(p_lbl, DOWN, buff=0.1)
        pg_group = VGroup(pg_box, p_lbl, p_sub)

        self.play(
            FadeIn(nginx_group, shift=RIGHT*0.3),
            FadeIn(front_group, shift=UP*0.3),
            FadeIn(back_group, shift=DOWN*0.3),
            FadeIn(redis_group, shift=LEFT*0.3),
            FadeIn(pg_group, shift=LEFT*0.3),
            run_time=1.0
        )

        # Flow Arrows
        a_in1 = Arrow(nginx_box.get_right() + UP*1.1, front_box.get_left(), buff=0.1, color="#ffffff", stroke_width=3)
        a_in2 = Arrow(nginx_box.get_right() + DOWN*1.1, back_box.get_left(), buff=0.1, color="#6db33f", stroke_width=3)
        a_core_redis = DoubleArrow(back_box.get_right() + UP*0.3, redis_box.get_left() + DOWN*0.3, buff=0.1, color="#ef4444", stroke_width=3.5)
        a_core_pg = DoubleArrow(back_box.get_right(), pg_box.get_left(), buff=0.1, color="#38bdf8", stroke_width=3)

        self.play(
            GrowArrow(a_in1), GrowArrow(a_in2),
            GrowArrow(a_core_redis), GrowArrow(a_core_pg),
            run_time=0.8
        )

        # Animated Pulse Dots (Telemetry Streams)
        dot_redis = Dot(color="#ef4444", radius=0.14).move_to(a_core_redis.get_start())
        dot_pg = Dot(color="#38bdf8", radius=0.12).move_to(a_core_pg.get_start())
        self.add(dot_redis, dot_pg)

        self.play(
            MoveAlongPath(dot_redis, Line(a_core_redis.get_start(), a_core_redis.get_end())),
            MoveAlongPath(dot_pg, Line(a_core_pg.get_start(), a_core_pg.get_end())),
            run_time=1.2,
            rate_func=linear
        )
        self.wait(1.0)


# -------------------------------------------------------------------------
# 2. SYSTEM DESIGN LEVEL 0: CONTEXT DATA FLOW DIAGRAM
# -------------------------------------------------------------------------
class SystemDesignLevel0Scene(Scene):
    def construct(self):
        title = Text("TriageNet - Level 0 Context System Design (DFD Level 0)", font="sans-serif", font_size=24, weight=BOLD)
        title.set_color_by_gradient("#ffffff", "#38bdf8")
        title.to_edge(UP, buff=0.35)
        self.play(FadeIn(title, shift=DOWN*0.2), run_time=0.6)

        # Center System Bubble
        center_circle = Circle(radius=1.6, color="#38bdf8", fill_color="#0f172a", fill_opacity=0.95, stroke_width=4)
        center_lbl1 = Text("0.0", font="sans-serif", font_size=16, color="#38bdf8", weight=BOLD).shift(UP * 0.5)
        center_lbl2 = Text("TriageNet\nStatewide Clinical OS", font="sans-serif", font_size=15, color=WHITE, weight=BOLD).shift(DOWN * 0.1)
        center_sys = VGroup(center_circle, center_lbl1, center_lbl2)
        self.play(FadeIn(center_sys, scale=0.85), run_time=0.8)

        # External Entities (6 Surrounding Rectangles)
        entities = [
            ("108 ALS Ambulance\n(Paramedic Fleet)", LEFT * 4.8 + UP * 1.5, "#3ddc84"),
            ("Hospital ED Staff\n(Nurses & Surgeons)", LEFT * 4.8 + DOWN * 1.5, "#38bdf8"),
            ("District CMO & State\nHealth Directorate", UP * 2.5, "#f59e0b"),
            ("Municipal Traffic\nITMS Controllers", RIGHT * 4.8 + UP * 1.5, "#10b981"),
            ("ABDM NHCX &\nNIC e-Hospital", RIGHT * 4.8 + DOWN * 1.5, "#a855f7"),
            ("Citizen Emergency\nCallers (Dial 108)", DOWN * 2.5, "#f43f5e"),
        ]

        boxes = []
        arrows_in = []
        arrows_out = []

        for name, pos, col in entities:
            box = RoundedRectangle(corner_radius=0.12, width=2.6, height=1.2, color=col, fill_color="#182234", fill_opacity=0.9)
            box.move_to(pos)
            lbl = Text(name, font="sans-serif", font_size=11, color=WHITE, weight=BOLD).move_to(box)
            grp = VGroup(box, lbl)
            boxes.append(grp)

            # Bidirectional arrows
            a_in = Arrow(box.get_center(), center_circle.get_center(), buff=1.65, color=col, stroke_width=2.5)
            arrows_in.append(a_in)

        self.play(*[FadeIn(b, shift=UP*0.2) for b in boxes], run_time=1.0)
        self.play(*[GrowArrow(a) for a in arrows_in], run_time=1.0)

        # Pulse particles converging to center and radiating out
        dots = [Dot(color=col, radius=0.1).move_to(b.get_center()) for b, (_, _, col) in zip(boxes, entities)]
        self.add(*dots)

        self.play(
            *[MoveAlongPath(d, Line(b.get_center(), center_circle.get_center())) for d, b in zip(dots, boxes)],
            run_time=1.2,
            rate_func=linear
        )
        self.wait(1.0)


# -------------------------------------------------------------------------
# 3. SYSTEM DESIGN LEVEL 1: CONTAINER DECOMPOSITION DIAGRAM
# -------------------------------------------------------------------------
class SystemDesignLevel1Scene(Scene):
    def construct(self):
        title = Text("TriageNet - Level 1 Process Decomposition (DFD Level 1)", font="sans-serif", font_size=24, weight=BOLD)
        title.set_color_by_gradient("#ffffff", "#10b981")
        title.to_edge(UP, buff=0.35)
        self.play(FadeIn(title, shift=DOWN*0.2), run_time=0.6)

        # 5 Major Processes (Circles)
        processes = [
            ("1.0\nClinical Intake &\nSeverityScorer", LEFT * 4.5 + UP * 1.0, "#38bdf8"),
            ("2.0\nDual-Bus Telemetry\n& Event Broker", LEFT * 1.5 + DOWN * 0.8, "#dc382d"),
            ("3.0\nHungarianMatcher\nSpecialist Alloc", RIGHT * 1.5 + UP * 1.0, "#10b981"),
            ("4.0\nDijkstraRouter &\nGreen Wave ITMS", RIGHT * 4.5 + DOWN * 0.8, "#f59e0b"),
            ("5.0\nStatewide Capacity\n& Grants Ledger", LEFT * 4.5 + DOWN * 2.2, "#a855f7"),
        ]

        p_groups = []
        for text, pos, color in processes:
            c = Circle(radius=0.9, color=color, fill_color="#0f172a", fill_opacity=0.95, stroke_width=3).move_to(pos)
            t = Text(text, font="sans-serif", font_size=9, color=WHITE, weight=BOLD).move_to(c)
            p_groups.append(VGroup(c, t))

        # 3 Data Stores (Open Cylinders / Double-Line Boxes)
        stores = [
            ("D1: PostgreSQL Relational DB (Patients, Staff, Grants)", UP * 2.2 + LEFT * 2.0, "#336791"),
            ("D2: PostGIS Road Network Graph (24 Districts)", UP * 2.2 + RIGHT * 2.5, "#10b981"),
            ("D3: Redis In-Memory State & Pub/Sub Queue", DOWN * 2.4 + RIGHT * 1.0, "#ef4444"),
        ]

        s_groups = []
        for text, pos, color in stores:
            box = Rectangle(width=4.2, height=0.65, color=color, fill_color="#182234", fill_opacity=0.9, stroke_width=2).move_to(pos)
            t = Text(text, font="sans-serif", font_size=9, color=WHITE).move_to(box)
            s_groups.append(VGroup(box, t))

        self.play(*[FadeIn(p, shift=UP*0.2) for p in p_groups], run_time=1.0)
        self.play(*[FadeIn(s, shift=DOWN*0.2) for s in s_groups], run_time=0.8)

        # Process-to-Process and Process-to-Store Links
        l1 = Arrow(p_groups[0].get_right(), p_groups[2].get_left() + UP*0.4, buff=0.2, color="#38bdf8", stroke_width=2.5)
        l2 = Arrow(p_groups[0].get_bottom(), p_groups[1].get_left(), buff=0.2, color="#38bdf8", stroke_width=2.5)
        l3 = Arrow(p_groups[1].get_right(), p_groups[3].get_left(), buff=0.2, color="#ef4444", stroke_width=2.5)
        l4 = Arrow(p_groups[2].get_right(), p_groups[3].get_left() + UP*0.8, buff=0.2, color="#10b981", stroke_width=2.5)

        self.play(GrowArrow(l1), GrowArrow(l2), GrowArrow(l3), GrowArrow(l4), run_time=1.0)
        self.wait(1.0)


# -------------------------------------------------------------------------
# 4. SAFETY & SECURITY ARCHITECTURE DIAGRAM
# -------------------------------------------------------------------------
class SafetySecurityArchitectureScene(Scene):
    def construct(self):
        title = Text("TriageNet - Multi-Layer Safety & Security Governance Framework", font="sans-serif", font_size=24, weight=BOLD)
        title.set_color_by_gradient("#ffffff", "#f43f5e")
        title.to_edge(UP, buff=0.35)
        self.play(FadeIn(title, shift=DOWN*0.2), run_time=0.6)

        # 3 Safety Pillars
        pillars = [
            ("CLINICAL PATIENT SAFETY", LEFT * 4.2, "#ef4444", [
                "• Sepsis Early Warning Alert",
                "• Shock Index > 0.9 Protocol",
                "• Emergency Bed Preemption",
                "• Acuity Wait-Aging (Zero Starvation)",
                "• Sub-50ms Hypoxia Pre-Alerts"
            ]),
            ("OPERATIONAL ACCESS GOVERNANCE", ORIGIN, "#f59e0b", [
                "• 6-Role Hierarchical RBAC",
                "• Dual-Control Clinician Signoff",
                "• FIDO2 / WebAuthn Hardware 2FA",
                "• Zero-Email Offline BIP-39 Auth",
                "• RateLimitingFilter (Anti-Brute Force)"
            ]),
            ("DATA & INFRASTRUCTURE INTEGRITY", RIGHT * 4.2, "#10b981", [
                "• PostgreSQL Row-Level Security (RLS)",
                "• Non-Root Containers (UID 1001)",
                "• Aqua Security Trivy (0 CVEs)",
                "• HttpOnly Cookie + Bearer JWT",
                "• Immutable Static Caching"
            ]),
        ]

        cards = []
        for p_title, pos, color, items in pillars:
            box = RoundedRectangle(corner_radius=0.15, width=3.8, height=4.6, color=color, fill_color="#0f172a", fill_opacity=0.92, stroke_width=2.5)
            box.move_to(pos + DOWN * 0.3)
            head = Text(p_title, font="sans-serif", font_size=11, color=color, weight=BOLD).next_to(box.get_top(), DOWN, buff=0.2)
            
            item_group = VGroup()
            for it in items:
                it_t = Text(it, font="sans-serif", font_size=10, color="#cbd5e1")
                item_group.add(it_t)
            item_group.arrange(DOWN, aligned_edge=LEFT, buff=0.28).next_to(head, DOWN, buff=0.35)

            cards.append(VGroup(box, head, item_group))

        self.play(*[FadeIn(c, shift=UP*0.4) for c in cards], run_time=1.2)
        self.wait(1.5)
