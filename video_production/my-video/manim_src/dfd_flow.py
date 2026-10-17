from manim import *

# Apple Keynote Color Palette
APPLE_BLACK = "#0d0d0f"
APPLE_DARK1 = "#1c1c1e"
APPLE_DARK2 = "#2c2c2e"
APPLE_BLUE = "#2997ff"
APPLE_MINT = "#30d158"
APPLE_AMBER = "#ffd60a"
APPLE_RED = "#ff453a"
APPLE_WHITE = "#ffffff"
APPLE_MUTED = "#a1a1a6"

class DFDFlowScene(Scene):
    def construct(self):
        self.camera.background_color = APPLE_BLACK

        # Header Titles
        title = Text(
            "SYSTEM DATA FLOW DIAGRAM (DFD LEVEL 1)",
            font="Arial",
            weight=BOLD,
            font_size=26,
            color=APPLE_BLUE,
        ).to_edge(UP, buff=0.35)

        subtitle = Text(
            "End-to-End Real-Time Field Intake, Algorithmic Matching & OR-3 Reservation",
            font="Arial",
            font_size=13,
            color=APPLE_MUTED,
        ).next_to(title, DOWN, buff=0.12)

        self.play(FadeIn(title, shift=UP * 0.2), FadeIn(subtitle, shift=UP * 0.2), run_time=0.7)

        # Helper to create clean visionOS DFD node
        def make_dfd_node(badge_txt, title_txt, sub_txt, accent_col, width=2.7, height=1.25):
            box = RoundedRectangle(
                corner_radius=0.14,
                width=width,
                height=height,
                fill_color=APPLE_DARK1,
                fill_opacity=0.96,
                stroke_color=accent_col,
                stroke_width=1.8,
            )
            badge = Text(badge_txt, font="Arial", weight=BOLD, font_size=9, color=accent_col).next_to(box.get_top(), DOWN, buff=0.12)
            t = Text(title_txt, font="Arial", weight=BOLD, font_size=12, color=APPLE_WHITE).next_to(badge, DOWN, buff=0.08)
            s = Text(sub_txt, font="Arial", font_size=9, color=APPLE_MUTED).next_to(t, DOWN, buff=0.06)
            return VGroup(box, badge, t, s)

        # Helper to create label pill
        def make_label_pill(text, col=APPLE_BLUE):
            bg = RoundedRectangle(
                corner_radius=0.08,
                width=len(text) * 0.085 + 0.35,
                height=0.30,
                fill_color="#101012",
                fill_opacity=0.96,
                stroke_color=col,
                stroke_width=0.9,
            )
            lbl = Text(text, font="Arial", weight=BOLD, font_size=8, color=APPLE_WHITE).move_to(bg)
            return VGroup(bg, lbl)

        # -----------------------------
        # TOP ROW: 3 Primary Ingestion Nodes (Y = 1.05) - Distance: 4.4 units!
        # -----------------------------
        y_top = 1.05
        n1 = make_dfd_node("PROCESS 1.0", "108 ALS Fleet", "Offline SQLite Intake", APPLE_MINT).move_to([-4.4, y_top, 0])
        n2 = make_dfd_node("PROCESS 2.0", "ML Acuity Core", "SeverityScorer 1.48ms", APPLE_AMBER).move_to([0.0, y_top, 0])
        n3 = make_dfd_node("PROCESS 3.0", "Priority Queue", "Redis Max-Heap", APPLE_RED).move_to([4.4, y_top, 0])

        top_nodes = VGroup(n1, n2, n3)

        # -----------------------------
        # BOTTOM ROW: Matching, Routing & Receiving (Y = -1.8) - Distance: 4.4 units!
        # -----------------------------
        y_bot = -1.8
        n4 = make_dfd_node("PROCESS 4.0", "Dijkstra Router", "Shortest Road Latency", APPLE_BLUE).move_to([-4.4, y_bot, 0])
        n_db = make_dfd_node("DATA STORES", "PostgreSQL Ledger", "111 Facilities & Vitals", "#8e8e93").move_to([0.0, y_bot, 0])
        n5 = make_dfd_node("ED RECEPTION", "Apex Trauma OR-3", "Pre-Arrival Team Ready", APPLE_MINT).move_to([4.4, y_bot, 0])

        bot_nodes = VGroup(n4, n_db, n5)

        self.play(
            LaggedStart(
                *[FadeIn(node, shift=UP * 0.15) for node in top_nodes],
                lag_ratio=0.15,
                run_time=0.9,
            )
        )
        self.play(
            LaggedStart(
                *[FadeIn(node, shift=UP * 0.15) for node in bot_nodes],
                lag_ratio=0.15,
                run_time=0.8,
            )
        )

        # -----------------------------
        # ARROWS & LABELS (Pills are placed strictly at Y = 2.10, completely above the boxes at Y=1.70!)
        # -----------------------------
        # 1 -> 2
        a1 = Arrow(n1.get_right(), n2.get_left(), buff=0.15, color=APPLE_MINT, stroke_width=2.5, max_tip_length_to_length_ratio=0.25)
        p1 = make_label_pill("Live Vitals (SpO2, GCS)", APPLE_MINT).move_to([-2.2, 2.10, 0])

        # 2 -> 3
        a2 = Arrow(n2.get_right(), n3.get_left(), buff=0.15, color=APPLE_AMBER, stroke_width=2.5, max_tip_length_to_length_ratio=0.25)
        p2 = make_label_pill("Acuity Score (0-100)", APPLE_AMBER).move_to([2.2, 2.10, 0])

        # 3 -> 5 (Vertical Arrow Down from Queue to OR-3 via Hungarian Matching)
        a3 = Arrow(n3.get_bottom(), n5.get_top(), buff=0.15, color=APPLE_RED, stroke_width=2.5, max_tip_length_to_length_ratio=0.25)
        p3 = make_label_pill("Hungarian Matcher: Bed & Specialist Locked", APPLE_RED).move_to([4.4, -0.38, 0])

        # 3 -> 4 (Curved diagonal down for Overflow Dijkstra routing)
        a4 = CurvedArrow(n3.get_left() + DOWN * 0.2, n4.get_right() + UP * 0.2, radius=4.0, color=APPLE_BLUE, stroke_width=2.2)
        p4 = make_label_pill("Capacity Overflow -> Dijkstra Routing", APPLE_BLUE).move_to([-0.2, -0.38, 0])

        # 4 -> DB -> 5 (Bottom Horizontal Flow)
        a5 = Arrow(n4.get_right(), n_db.get_left(), buff=0.15, color=APPLE_BLUE, stroke_width=2.2)
        a6 = Arrow(n_db.get_right(), n5.get_left(), buff=0.15, color=APPLE_MINT, stroke_width=2.2)
        p6 = make_label_pill("108 Green Wave Pre-Alert", APPLE_MINT).move_to([2.2, -2.75, 0])

        self.play(
            Create(a1), FadeIn(p1),
            Create(a2), FadeIn(p2),
            Create(a3), FadeIn(p3),
            run_time=1.0,
        )
        self.play(
            Create(a4), FadeIn(p4),
            Create(a5), Create(a6), FadeIn(p6),
            run_time=1.0,
        )

        # -----------------------------
        # FLOWING PACKET PULSES
        # -----------------------------
        packet1 = Dot(color=APPLE_MINT, radius=0.09).move_to(n1.get_right())
        packet2 = Dot(color=APPLE_AMBER, radius=0.09).move_to(n2.get_right())
        packet3 = Dot(color=APPLE_RED, radius=0.09).move_to(n3.get_bottom())

        self.play(
            MoveAlongPath(packet1, a1),
            MoveAlongPath(packet2, a2),
            MoveAlongPath(packet3, a3),
            run_time=1.2,
            rate_func=linear,
        )
        self.play(FadeOut(packet1), FadeOut(packet2), FadeOut(packet3), run_time=0.3)

        self.wait(3.0)
