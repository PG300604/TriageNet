from manim import *
import os

config.pixel_width = 1280
config.pixel_height = 720
config.frame_rate = 30
config.background_color = "#08090d"

class SystemArchitectureDiagram(Scene):
    def construct(self):
        # Title
        title = Text("TriageNet - End-to-End System Architecture", font="sans-serif", font_size=28, weight=BOLD)
        title.set_color_by_gradient("#ffffff", "#38bdf8")
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title, shift=DOWN*0.3), run_time=0.6)

        # 3 Main Tier Columns: Edge Client, Reactive Bus, Cloud Core
        col1 = RoundedRectangle(corner_radius=0.15, width=3.4, height=4.4, color="#38bdf8", fill_color="#0f172a", fill_opacity=0.85)
        col1.shift(LEFT * 4.0 + DOWN * 0.2)
        label1 = Text("Edge & Mobile Clients", font="sans-serif", font_size=16, weight=BOLD, color="#38bdf8").next_to(col1.get_top(), DOWN, buff=0.2)

        n1 = RoundedRectangle(corner_radius=0.1, width=2.8, height=0.7, color="#3ddc84", fill_color="#1e293b", fill_opacity=0.9).next_to(label1, DOWN, buff=0.25)
        t1 = Text("108 ALS Ambulance (Android)", font="sans-serif", font_size=12, color=WHITE).move_to(n1)

        n2 = RoundedRectangle(corner_radius=0.1, width=2.8, height=0.7, color="#ffffff", fill_color="#1e293b", fill_opacity=0.9).next_to(n1, DOWN, buff=0.2)
        t2 = Text("Next.js 16 Web Console", font="sans-serif", font_size=12, color=WHITE).move_to(n2)

        n3 = RoundedRectangle(corner_radius=0.1, width=2.8, height=0.7, color="#f59e0b", fill_color="#1e293b", fill_opacity=0.9).next_to(n2, DOWN, buff=0.2)
        t3 = Text("Director Control (/control)", font="sans-serif", font_size=12, color=WHITE).move_to(n3)

        group1 = VGroup(col1, label1, n1, t1, n2, t2, n3, t3)

        # Center: Core Engine
        col2 = RoundedRectangle(corner_radius=0.15, width=3.4, height=4.4, color="#6db33f", fill_color="#0f172a", fill_opacity=0.85)
        col2.shift(DOWN * 0.2)
        label2 = Text("TriageNet Core Engine", font="sans-serif", font_size=16, weight=BOLD, color="#6db33f").next_to(col2.get_top(), DOWN, buff=0.2)

        n4 = RoundedRectangle(corner_radius=0.1, width=2.8, height=0.7, color="#6db33f", fill_color="#1e293b", fill_opacity=0.9).next_to(label2, DOWN, buff=0.25)
        t4 = Text("Spring Boot 3.3.13 (Java 17)", font="sans-serif", font_size=12, color=WHITE).move_to(n4)

        n5 = RoundedRectangle(corner_radius=0.1, width=2.8, height=0.7, color="#dc382d", fill_color="#1e293b", fill_opacity=0.9).next_to(n4, DOWN, buff=0.2)
        t5 = Text("Redis 7 Pub/Sub STOMP", font="sans-serif", font_size=12, color=WHITE).move_to(n5)

        n6 = RoundedRectangle(corner_radius=0.1, width=2.8, height=0.7, color="#38bdf8", fill_color="#1e293b", fill_opacity=0.9).next_to(n5, DOWN, buff=0.2)
        t6 = Text("Sub-50ms Dual-Bus Broker", font="sans-serif", font_size=12, color=WHITE).move_to(n6)

        group2 = VGroup(col2, label2, n4, t4, n5, t5, n6, t6)

        # Right: 4 Algorithms & Database
        col3 = RoundedRectangle(corner_radius=0.15, width=3.4, height=4.4, color="#a855f7", fill_color="#0f172a", fill_opacity=0.85)
        col3.shift(RIGHT * 4.0 + DOWN * 0.2)
        label3 = Text("Algorithms & Data", font="sans-serif", font_size=16, weight=BOLD, color="#a855f7").next_to(col3.get_top(), DOWN, buff=0.2)

        n7 = RoundedRectangle(corner_radius=0.1, width=2.8, height=0.6, color="#f43f5e", fill_color="#1e293b", fill_opacity=0.9).next_to(label3, DOWN, buff=0.2)
        t7 = Text("SeverityScorer (Sigmoid)", font="sans-serif", font_size=11, color=WHITE).move_to(n7)

        n8 = RoundedRectangle(corner_radius=0.1, width=2.8, height=0.6, color="#10b981", fill_color="#1e293b", fill_opacity=0.9).next_to(n7, DOWN, buff=0.15)
        t8 = Text("HungarianMatcher O(V³)", font="sans-serif", font_size=11, color=WHITE).move_to(n8)

        n9 = RoundedRectangle(corner_radius=0.1, width=2.8, height=0.6, color="#f59e0b", fill_color="#1e293b", fill_opacity=0.9).next_to(n8, DOWN, buff=0.15)
        t9 = Text("DijkstraRouter & ITMS", font="sans-serif", font_size=11, color=WHITE).move_to(n9)

        n10 = RoundedRectangle(corner_radius=0.1, width=2.8, height=0.6, color="#336791", fill_color="#1e293b", fill_opacity=0.9).next_to(n9, DOWN, buff=0.15)
        t10 = Text("PostgreSQL 16 + PostGIS", font="sans-serif", font_size=11, color=WHITE).move_to(n10)

        group3 = VGroup(col3, label3, n7, t7, n8, t8, n9, t9, n10, t10)

        # Animate Groups
        self.play(
            FadeIn(group1, shift=RIGHT*0.5),
            FadeIn(group2, shift=UP*0.5),
            FadeIn(group3, shift=LEFT*0.5),
            run_time=1.0
        )

        # Connecting Laser Streams
        arrow1 = Arrow(col1.get_right(), col2.get_left(), buff=0.15, color="#38bdf8", stroke_width=4)
        arrow2 = Arrow(col2.get_right(), col3.get_left(), buff=0.15, color="#10b981", stroke_width=4)
        
        lbl_arr1 = Text("Telemetry < 50ms", font="sans-serif", font_size=10, color="#38bdf8").next_to(arrow1, UP, buff=0.08)
        lbl_arr2 = Text("O(V³) Match & Route", font="sans-serif", font_size=10, color="#10b981").next_to(arrow2, UP, buff=0.08)

        self.play(
            GrowArrow(arrow1),
            FadeIn(lbl_arr1),
            GrowArrow(arrow2),
            FadeIn(lbl_arr2),
            run_time=0.8
        )

        # Glowing Pulse Packet traveling
        dot1 = Dot(color="#38bdf8", radius=0.12).move_to(arrow1.get_start())
        dot2 = Dot(color="#10b981", radius=0.12).move_to(arrow2.get_start())
        self.add(dot1, dot2)

        self.play(
            MoveAlongPath(dot1, Line(arrow1.get_start(), arrow1.get_end())),
            MoveAlongPath(dot2, Line(arrow2.get_start(), arrow2.get_end())),
            run_time=1.2,
            rate_func=linear
        )
        self.wait(1.0)

class HighwayGreenWaveGraph(Scene):
    def construct(self):
        title = Text("Dijkstra Dynamic Highway Graph & 108 Green Wave Preemption", font="sans-serif", font_size=24, weight=BOLD)
        title.set_color_by_gradient("#ffffff", "#10b981")
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title, shift=DOWN*0.3), run_time=0.6)

        # Nodes
        coords = {
            "Ranchi (Apex RIMS)": LEFT * 4.5 + DOWN * 0.5,
            "Ormanjhi NH-33": LEFT * 1.5 + UP * 1.2,
            "Ramgarh Bypass": RIGHT * 1.5 + DOWN * 0.2,
            "Hazaribagh Sadar": RIGHT * 4.5 + UP * 1.5,
            "Bokaro Steel City": RIGHT * 4.0 + DOWN * 2.0,
        }

        nodes = {}
        labels = {}
        for name, pos in coords.items():
            color = "#ef4444" if "RIMS" in name else "#38bdf8"
            circle = Circle(radius=0.45, color=color, fill_color="#0f172a", fill_opacity=0.9, stroke_width=3).move_to(pos)
            lbl = Text(name.split()[0], font="sans-serif", font_size=12, color=WHITE).next_to(circle, UP, buff=0.1)
            nodes[name] = circle
            labels[name] = lbl

        # Edges
        edges_data = [
            ("Ranchi (Apex RIMS)", "Ormanjhi NH-33", "24 km · C=1.0"),
            ("Ormanjhi NH-33", "Ramgarh Bypass", "28 km · C=1.2"),
            ("Ramgarh Bypass", "Hazaribagh Sadar", "46 km · C=1.1"),
            ("Ormanjhi NH-33", "Bokaro Steel City", "52 km · C=1.4"),
            ("Ramgarh Bypass", "Bokaro Steel City", "38 km · C=1.0"),
        ]

        edges = []
        edge_lbls = []
        for u, v, w in edges_data:
            line = Line(nodes[u].get_center(), nodes[v].get_center(), buff=0.45, color="#64748b", stroke_width=2.5)
            mid = line.get_center()
            lbl = Text(w, font="sans-serif", font_size=9, color="#94a3b8").move_to(mid + UP * 0.18)
            edges.append(line)
            edge_lbls.append(lbl)

        node_group = VGroup(*nodes.values(), *labels.values())
        edge_group = VGroup(*edges, *edge_lbls)

        self.play(Create(edge_group), run_time=1.0)
        self.play(FadeIn(node_group), run_time=0.8)

        # Highlight Shortest Dijkstra Path with Green Wave
        gw1 = Line(nodes["Hazaribagh Sadar"].get_center(), nodes["Ramgarh Bypass"].get_center(), buff=0.45, color="#10b981", stroke_width=6)
        gw2 = Line(nodes["Ramgarh Bypass"].get_center(), nodes["Ormanjhi NH-33"].get_center(), buff=0.45, color="#10b981", stroke_width=6)
        gw3 = Line(nodes["Ormanjhi NH-33"].get_center(), nodes["Ranchi (Apex RIMS)"].get_center(), buff=0.45, color="#10b981", stroke_width=6)

        banner = RoundedRectangle(corner_radius=0.1, width=6.5, height=0.6, color="#10b981", fill_color="#064e3b", fill_opacity=0.9).to_edge(DOWN, buff=0.4)
        banner_txt = Text("⚡ 108 GREEN WAVE ACTIVE · SIGNALS PREEMPTED TO ALL-GREEN", font="sans-serif", font_size=13, weight=BOLD, color=WHITE).move_to(banner)

        self.play(
            Create(gw1),
            Create(gw2),
            Create(gw3),
            FadeIn(banner),
            FadeIn(banner_txt),
            run_time=1.2
        )

        # Pulse Traveling Ambulance Dot
        amb_dot = Dot(color="#38bdf8", radius=0.15).move_to(gw1.get_start())
        self.add(amb_dot)
        self.play(
            MoveAlongPath(amb_dot, Line(gw1.get_start(), gw1.get_end())),
            run_time=0.8,
            rate_func=linear
        )
        self.play(
            MoveAlongPath(amb_dot, Line(gw2.get_start(), gw2.get_end())),
            run_time=0.8,
            rate_func=linear
        )
        self.play(
            MoveAlongPath(amb_dot, Line(gw3.get_start(), gw3.get_end())),
            run_time=0.8,
            rate_func=linear
        )
        self.wait(1.0)
