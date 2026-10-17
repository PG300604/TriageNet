import os
import shutil
from manim import *

config.pixel_width = 1920
config.pixel_height = 1080
config.frame_rate = 60
config.background_color = "#121214"

ACTION_BLUE = "#2997ff"
MINT_GREEN = "#30d158"
AMBER = "#ffd60a"
NEON_RED = "#ff453a"
WHITE = "#ffffff"
MUTED = "#86868b"
GLASS_BORDER = "#3a3a3c"
GLASS_FILL = "#1c1c1e"

# -------------------------------------------------------------
# 1. DATA FLOW DIAGRAM ANIMATION (DFD Flow)
# -------------------------------------------------------------
class DfdFlowScene(Scene):
    def construct(self):
        title = Text("SYSTEM DATA FLOW DIAGRAM", font="sans-serif", weight=BOLD).scale(0.68).to_edge(UP, buff=0.55)
        title.set_color(ACTION_BLUE)
        subtitle = Text("End-to-End Real-Time Trauma Ingestion & Surgical Pre-Alert", font="sans-serif").scale(0.40).next_to(title, DOWN, buff=0.15)
        subtitle.set_color(MUTED)

        self.play(FadeIn(title, shift=UP*0.2), FadeIn(subtitle), run_time=0.6)

        def make_dfd_node(number, name, role, color, pos):
            card = RoundedRectangle(corner_radius=0.18, height=1.45, width=2.45, color=color, fill_color=GLASS_FILL, fill_opacity=0.92, stroke_width=2.5)
            card.move_to(pos)
            badge = Text(number, font="sans-serif", weight=BOLD).scale(0.28).set_color(color).move_to(card.get_top() + DOWN*0.24)
            label = Text(name, font="sans-serif", weight=BOLD).scale(0.38).set_color(WHITE).move_to(card.get_center() + UP*0.05)
            sub = Text(role, font="sans-serif").scale(0.24).set_color(MUTED).move_to(card.get_bottom() + UP*0.24)
            return VGroup(card, badge, label, sub)

        n1 = make_dfd_node("PROCESS 1.0", "108 ALS Fleet", "Offline Kotlin SQLite", MINT_GREEN, LEFT * 4.9 + DOWN * 0.2)
        n2 = make_dfd_node("PROCESS 2.0", "Spring Boot 3", "Reactive WebFlux", ACTION_BLUE, LEFT * 2.45 + DOWN * 0.2)
        n3 = make_dfd_node("PROCESS 3.0", "ML Acuity", "SeverityScorer Engine", NEON_RED, ORIGIN + DOWN * 0.2)
        n4 = make_dfd_node("PROCESS 4.0", "Redis Heap", "In-Memory Max-Heap", AMBER, RIGHT * 2.45 + DOWN * 0.2)
        n5 = make_dfd_node("PROCESS 5.0", "Apex Trauma", "OR-3 Surgical Bay", MINT_GREEN, RIGHT * 4.9 + DOWN * 0.2)

        nodes = VGroup(n1, n2, n3, n4, n5)
        self.play(LaggedStart(*[FadeIn(n, scale=0.92) for n in nodes], lag_ratio=0.12), run_time=1.2)

        def make_flow_arrow(start_n, end_n, label_text):
            arr = Arrow(start_n.get_right(), end_n.get_left(), buff=0.12, color=ACTION_BLUE, stroke_width=3.2, max_tip_length_to_length_ratio=0.22)
            lbl = Text(label_text, font="sans-serif").scale(0.26).set_color(WHITE).next_to(arr, UP, buff=0.08)
            return VGroup(arr, lbl)

        a1 = make_flow_arrow(n1, n2, "Live Vitals (GCS, SpO2)")
        a2 = make_flow_arrow(n2, n3, "Patient Shock Vector")
        a3 = make_flow_arrow(n3, n4, "Acuity Priority Rank")
        a4 = make_flow_arrow(n4, n5, "Zero-Min Pre-Alert")

        arrows = VGroup(a1, a2, a3, a4)
        self.play(LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.18), run_time=1.2)

        # Pulse particle moving through DFD
        dot = Dot(color=MINT_GREEN, radius=0.14)
        glow = Dot(color=MINT_GREEN, radius=0.30, fill_opacity=0.35)
        pulse = VGroup(glow, dot).move_to(n1.get_center())

        self.play(FadeIn(pulse, scale=0.5), run_time=0.2)
        for target in [n2, n3, n4, n5]:
            self.play(pulse.animate.move_to(target.get_center()), run_time=0.45, rate_func=linear)

        # Architectural Metrics Glass Pill
        pill = RoundedRectangle(corner_radius=0.18, height=0.85, width=11.2, color=GLASS_BORDER, fill_color="#18181a", fill_opacity=0.96, stroke_width=1.5)
        pill.to_edge(DOWN, buff=0.6)

        m1 = Text("PIPELINE LATENCY: < 280ms", font="sans-serif", weight=BOLD).scale(0.32).set_color(MINT_GREEN)
        m2 = Text("PRECISION: 99.4% ALLOCATION", font="sans-serif", weight=BOLD).scale(0.32).set_color(ACTION_BLUE)
        m3 = Text("TOPOLOGY: 24 SADAR HUBS", font="sans-serif", weight=BOLD).scale(0.32).set_color(AMBER)

        specs = VGroup(m1, m2, m3).arrange(RIGHT, buff=0.9).move_to(pill.get_center())
        self.play(FadeIn(pill, shift=UP*0.25), FadeIn(specs), run_time=0.6)
        self.wait(1.5)


# -------------------------------------------------------------
# 2. MACHINE LEARNING & BENCHMARK SUITE ANIMATION
# -------------------------------------------------------------
class MlAndBenchmarkScene(Scene):
    def construct(self):
        title = Text("MACHINE LEARNING ACUITY & BENCHMARK SUITE", font="sans-serif", weight=BOLD).scale(0.68).to_edge(UP, buff=0.55)
        title.set_color(ACTION_BLUE)
        subtitle = Text("SeverityScorer Logistic Inference & Kuhn-Munkres Optimization", font="sans-serif").scale(0.40).next_to(title, DOWN, buff=0.15)
        subtitle.set_color(MUTED)

        self.play(FadeIn(title, shift=UP*0.2), FadeIn(subtitle), run_time=0.6)

        # Left: Animated Sigmoid ML Acuity Curve
        ax = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 1.2, 0.5],
            x_length=4.8,
            y_length=3.2,
            axis_config={"color": MUTED, "stroke_width": 2},
        ).to_edge(LEFT, buff=1.2).shift(DOWN * 0.1)

        ax_lbl = Text("Triage Sigmoid Acuity Function: P(Code Red) = 1 / (1 + e^-z)", font="sans-serif").scale(0.30).set_color(MUTED).next_to(ax, UP, buff=0.2)
        curve = ax.plot(lambda x: 1 / (1 + np.exp(-x)), color=ACTION_BLUE, stroke_width=3.5)

        # Critical threshold point
        crit_dot = Dot(ax.c2p(2.2, 1 / (1 + np.exp(-2.2))), color=NEON_RED, radius=0.14)
        crit_lbl = Text("● Level 1 Acuity (P = 0.90)", font="sans-serif", weight=BOLD).scale(0.30).set_color(NEON_RED).next_to(crit_dot, UP + LEFT * 0.3, buff=0.15)

        self.play(Create(ax), FadeIn(ax_lbl), run_time=0.8)
        self.play(Create(curve), run_time=1.0)
        self.play(FadeIn(crit_dot, scale=0.5), FadeIn(crit_lbl), run_time=0.5)

        # Right: 4 Benchmark Stat Cards
        def make_stat_card(val, label, note, color, pos):
            card = RoundedRectangle(corner_radius=0.18, height=1.35, width=4.8, color=GLASS_BORDER, fill_color=GLASS_FILL, fill_opacity=0.92, stroke_width=1.5)
            card.move_to(pos)
            v = Text(val, font="sans-serif", weight=BOLD).scale(0.55).set_color(color).move_to(card.get_left() + RIGHT * 1.0)
            l = Text(label, font="sans-serif", weight=BOLD).scale(0.32).set_color(WHITE).next_to(v, RIGHT, buff=0.35).shift(UP * 0.12)
            n = Text(note, font="sans-serif").scale(0.24).set_color(MUTED).next_to(l, DOWN, buff=0.08, aligned_edge=LEFT)
            return VGroup(card, v, l, n)

        c1 = make_stat_card("1.48 ms", "Inference Latency", "SeverityScorer Java 21 WebFlux", MINT_GREEN, RIGHT * 2.8 + UP * 1.3)
        c2 = make_stat_card("99.4%", "Bipartite Match Accuracy", "HungarianMatcher.java O(V³)", ACTION_BLUE, RIGHT * 2.8 + UP * -0.1)
        c3 = make_stat_card("–42%", "Transit Time Reduced", "Dijkstra Green Wave Signal Preemption", AMBER, RIGHT * 2.8 + DOWN * 1.5)

        cards = VGroup(c1, c2, c3)
        self.play(LaggedStart(*[FadeIn(c, shift=LEFT*0.3) for c in cards], lag_ratio=0.18), run_time=1.2)
        self.wait(1.5)
