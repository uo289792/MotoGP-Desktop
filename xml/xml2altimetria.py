#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET

NS = {"u": "http://www.uniovi.es"}

class Svg:
    def __init__(self, width=1000, height=450, margin=50):
        self.width = width
        self.height = height
        self.margin = margin
        self.content = []

    def header(self):
        return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{self.width}" height="{self.height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Altimetría del circuito">
  <desc>Perfil altimétrico generado desde circuitoEsquema.xml</desc>
'''

    def footer(self):
        return '</svg>\n'

    def add(self, s):
        self.content.append(s)

    def axis(self):
        x0, y0 = self.margin, self.height - self.margin
        xmax, ymax = self.width - self.margin, self.margin
        self.add(f'  <line x1="{x0}" y1="{y0}" x2="{xmax}" y2="{y0}" stroke="#333"/>\n')
        self.add(f'  <line x1="{x0}" y1="{y0}" x2="{x0}" y2="{ymax}" stroke="#333"/>\n')

    def labels(self):
        self.add(f'  <text x="{self.margin}" y="{self.margin-15}" font-size="13" fill="#333">Altitud (m)</text>\n')
        self.add(f'  <text x="{self.width-self.margin-90}" y="{self.height-self.margin+30}" font-size="13" fill="#333">Distancia (m)</text>\n')

    def grid_and_y_labels(self, max_alt):
        min_alt = 240
        alt_range = max_alt - min_alt
        step = 10 if alt_range <= 100 else 20 if alt_range <= 300 else 50

        for alt in range(min_alt, max_alt + 1, step):
            y = self.height - self.margin - (alt - min_alt) * (self.height - 2 * self.margin) / alt_range
            stroke = "#ccc" if alt % 50 == 0 else "#eee"
            self.add(f'  <line x1="{self.margin}" y1="{y}" x2="{self.width - self.margin}" y2="{y}" stroke="{stroke}"/>\n')
            self.add(f'  <text x="{self.margin - 12}" y="{y + 4}" font-size="11" text-anchor="end" fill="#333">{alt}</text>\n')

    def polyline(self, points, stroke="#1e90ff", fill="rgba(30,144,255,0.15)", stroke_width=2):
        coords = " ".join([f"{x},{y}" for x, y in points])
        self.add(f'  <polyline points="{coords}" fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width}"/>\n')

    def x_labels_rotated(self, scaled_points, etiquetas_x):
        y = self.height - self.margin + 35
        for (x, _), label in zip(scaled_points, etiquetas_x):
            if label:
                self.add(f'''  <text x="{x}" y="{y}" font-size="12" text-anchor="middle" fill="#333" transform="rotate(-35 {x},{y})">{label}</text>\n''')

    def to_string(self):
        return self.header() + "".join(self.content) + self.footer()

def read_dom(path):
    return ET.parse(path).getroot()

def extract_dist_alt_etiquetas(root):
    puntos = []
    altitudes = []
    etiquetas = []

    x_acc = 0
    alt0_el = root.find(".//u:origen/u:altitud", NS)
    if alt0_el is not None and alt0_el.text is not None:
        alt0 = int(alt0_el.text)
        puntos.append((0, alt0))
        altitudes.append(alt0)
        etiquetas.append("Origen")

    for tramo in root.findall(".//u:tramos/u:tramo", NS):
        dist_attr = tramo.find("./u:distancia", NS).attrib.get("value")
        alt_el = tramo.find("./u:punto/u:altitud", NS)
        tid = tramo.attrib.get("id")
        if dist_attr is None or alt_el is None or alt_el.text is None:
            continue
        dist = int(dist_attr)
        alt = int(alt_el.text)
        x_acc += dist
        puntos.append((x_acc, alt))
        altitudes.append(alt)

        if tid == "t1":
            etiquetas.append("Sector 1")
        elif tid == "t16":
            etiquetas.append("Sector 2")
        elif tid == "t33":
            etiquetas.append("Sector 3")
        elif tid == "t55":
            etiquetas.append("Final")
        else:
            etiquetas.append("")

    return puntos, altitudes, etiquetas

def scale_points(points, width=1000, height=450, margin=50, min_alt=240):
    if not points:
        return [], 0
    max_x = max(x for x, _ in points) or 1
    max_alt = max(a for _, a in points)
    scale_x = (width - 2 * margin) / max_x
    scale_y = (height - 2 * margin) / (max_alt - min_alt)
    scaled = []
    for x_m, alt_m in points:
        x = margin + x_m * scale_x
        y = height - margin - (alt_m - min_alt) * scale_y
        scaled.append((x, y))
    return scaled, max_alt

def xml2altimetria(xml_path: str, svg_path: str):
    root = read_dom(xml_path)
    pts, alts, etiquetas = extract_dist_alt_etiquetas(root)
    scaled, max_alt = scale_points(pts)

    svg = Svg()
    svg.grid_and_y_labels(max_alt)
    svg.axis()
    svg.labels()

    if scaled:
        floor_left = (scaled[0][0], svg.height - svg.margin)
        floor_right = (scaled[-1][0], svg.height - svg.margin)
        closed = [floor_left] + scaled + [floor_right]
        svg.polyline(closed)
        svg.x_labels_rotated(scaled, etiquetas)
    else:
        svg.add('  <text x="50" y="50" font-size="14" fill="#c00">Sin datos de altimetría</text>\n')

    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg.to_string())

if __name__ == "__main__":
    xml2altimetria("circuitoEsquema.xml", "altimetria.svg")
    print("Generado altimetria.svg")
