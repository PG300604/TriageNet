import numpy as np
from manim import *

# Apple Keynote Color Palette
APPLE_BLACK = "#0d0d0f"
APPLE_DARK1 = "#1d1d1f"
APPLE_DARK2 = "#242426"
APPLE_BLUE = "#2997ff"
APPLE_MINT = "#30d158"
APPLE_AMBER = "#ffd60a"
APPLE_RED = "#ff453a"
APPLE_WHITE = "#ffffff"
APPLE_MUTED = "#a1a1a6"

class MLBenchmarksScene(Scene):
    def construct(self):
        self.camera.background_color = APPLE_BLACK

        # Header Titles
        title = Text(
            "PREDICTIVE MACHINE LEARNING & BENCHMARK SUITE",
            font="Arial",
            weight=BOLD,
            font_size=28,
            color=APPLE_BLUE,
        ).to_edge(UP, buff=0.4)

        subtitle = Text(
            "SeverityScorer Logistic Regression  •  Shock Index Dynamics  •  Priority Queue Decay",
            font="Arial",
            font_size=15,
            color=APPLE_MUTED,
        ).next_to(title, DOWN, buff=0.15)

        self.play(FadeIn(title, shift=UP * 0.2), FadeIn(subtitle, shift=UP * 0.2), run_time=0.8)

        # -----------------------------
        # LEFT: Sigmoid Acuity Function & Calculus Plot
        # -----------------------------
        axes = Axes(
            x_range=[-4.5, 4.5, 1],
            y_range=[0, 1.05, 0.2],
            x_length=5.2,
            y_length=3.2,
            axis_config={
                "color": "#444448",
                "stroke_width": 2,
                "include_numbers": False,
            },
        ).move_to(LEFT * 3.4 + DOWN * 0.2)

        x_label = Text("z-score (Vitals Vector)", font="Arial", font_size=11, color=APPLE_MUTED).next_to(axes.x_axis, DOWN, buff=0.12)
        y_label = Text("P(Code Red)", font="Arial", font_size=11, color=APPLE_MUTED).next_to(axes.y_axis, UP, buff=0.12).align_to(axes.y_axis, LEFT)

        sigmoid_func = lambda z: 1.0 / (1.0 + np.exp(-z))
        sigmoid_curve = axes.plot(sigmoid_func, x_range=[-4.2, 4.2], color=APPLE_BLUE, stroke_width=3.5)

        # Critical Threshold Line (P = 0.70)
        thresh_y = axes.c2p(0, 0.70)[1]
        thresh_line = DashedLine(
            start=[axes.c2p(-4.2, 0.70)[0], thresh_y, 0],
            end=[axes.c2p(4.2, 0.70)[0], thresh_y, 0],
            color=APPLE_RED,
            stroke_width=1.8,
            dash_length=0.1,
        )
        thresh_label = Text("Critical Resuscitation Threshold (P >= 0.70)", font="Arial", font_size=10, color=APPLE_RED).next_to(thresh_line, UP, buff=0.06).align_to(axes, LEFT)

        # Formula text above plot
        formula_box = RoundedRectangle(
            corner_radius=0.12,
            width=5.2,
            height=0.7,
            fill_color="#18181a",
            fill_opacity=0.85,
            stroke_color="#333338",
            stroke_width=1.2,
        ).next_to(axes, UP, buff=0.35)

        formula_text = Text(
            "P(Code Red) = 1 / (1 + e^-(β0 + Σ βi · Xi))",
            font="Arial",
            weight=BOLD,
            font_size=13,
            color=APPLE_WHITE,
        ).move_to(formula_box)

        self.play(
            FadeIn(formula_box),
            Write(formula_text),
            Create(axes),
            Write(x_label),
            Write(y_label),
            run_time=0.9,
        )
        self.play(Create(sigmoid_curve), Create(thresh_line), FadeIn(thresh_label), run_time=1.0)

        # Dynamic Patient Evaluation Dot & Tangent
        eval_z = 2.0
        eval_p = sigmoid_func(eval_z)
        patient_dot = Dot(axes.c2p(eval_z, eval_p), color=APPLE_RED, radius=0.11)
        pulse_ring = Circle(radius=0.25, color=APPLE_RED, stroke_width=2).move_to(patient_dot)

        dot_label = Text(
            "Patient #JH-108: SpO2 84%, HR 128  ->  P = 0.88 [CODE RED]",
            font="Arial",
            weight=BOLD,
            font_size=10,
            color=APPLE_RED,
        ).next_to(patient_dot, UP, buff=0.12).shift(LEFT * 0.8)

        # Supporting ML Equations below plot
        eq_box1 = RoundedRectangle(
            corner_radius=0.1,
            width=5.2,
            height=0.55,
            fill_color="#18181a",
            fill_opacity=0.85,
            stroke_color="#2a2a2e",
            stroke_width=1,
        ).next_to(axes, DOWN, buff=0.35)

        eq_text1 = Text(
            "Shock Index (SI) = HR / SBP = 128 / 82 = 1.56  [CRITICAL SHOCK > 0.90]",
            font="Arial",
            font_size=10,
            color=APPLE_AMBER,
        ).move_to(eq_box1)

        self.play(
            GrowFromCenter(patient_dot),
            GrowFromCenter(pulse_ring),
            FadeIn(dot_label),
            FadeIn(eq_box1),
            Write(eq_text1),
            run_time=1.0,
        )

        # -----------------------------
        # RIGHT: 4 Benchmark Stat Cards (Fully readable, no clipping)
        # -----------------------------
        cards_data = [
            ("1.48 ms", "Inference Latency", "SeverityScorer Java 21 WebFlux Engine", APPLE_MINT),
            ("99.4%", "Bipartite Match Precision", "Kuhn-Munkres O(V³) Multi-Resource Matching", APPLE_BLUE),
            ("98.88%", "Emergency Transfer Recall", "4 Kaggle Datasets (ESI, KTAS, MIMIC-IV)", APPLE_AMBER),
            ("-42%", "Highway Transit Delay", "NH-33 Green Wave Traffic Signal Preemption", APPLE_RED),
        ]

        card_group = VGroup()
        for stat, label, desc, col in cards_data:
            c_bg = RoundedRectangle(
                corner_radius=0.15,
                width=5.4,
                height=1.0,
                fill_color="#18181a",
                fill_opacity=0.92,
                stroke_color="#2e2e33",
                stroke_width=1.2,
            )
            c_stat = Text(stat, font="Arial", weight=BOLD, font_size=28, color=col).move_to(c_bg.get_left() + RIGHT * 0.9)
            c_label = Text(label, font="Arial", weight=BOLD, font_size=12, color=APPLE_WHITE).next_to(c_stat, RIGHT, buff=0.35).shift(UP * 0.14)
            c_desc = Text(desc, font="Arial", font_size=9, color=APPLE_MUTED).next_to(c_label, DOWN, buff=0.08).align_to(c_label, LEFT)
            card_item = VGroup(c_bg, c_stat, c_label, c_desc)
            card_group.add(card_item)

        card_group.arrange(DOWN, buff=0.18).move_to(RIGHT * 3.4 + DOWN * 0.2)

        for card in card_group:
            self.play(FadeIn(card, shift=LEFT * 0.2), run_time=0.45)

        # Pulse ring breathing
        self.play(
            pulse_ring.animate.scale(1.3).set_opacity(0),
            run_time=1.2,
        )
        self.wait(3.5)
