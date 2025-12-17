#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET

NS = {"u": "http://www.uniovi.es"}

class Html:
    def __init__(self, title="MotoGP-Información", css_href="estilo/estilo.css", lang="es"):
        self.title = title
        self.css_href = css_href
        self.lang = lang
        self.parts = []

    def head(self):
        return f"""<!DOCTYPE HTML>
<html lang="{self.lang}">
<head>
    <meta charset="UTF-8" />
    <meta name="author" content="David Muños Río" />
    <meta name="description" content="Información xml del proyecto MotoGP-Desktop" />
    <meta name="keywords" content="MotoGP, MotoGP-Desktop, xml" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{self.title}</title>
    <link rel="stylesheet" href="{self.css_href}" />
    <link rel="icon" href="multimedia/favicon.ico" type="image/x-icon">
</head>
"""

    def open_body(self):
        return "<body>\n  <header>\n    <h1>Información del circuito</h1>\n  </header>\n  <main>\n"

    def close_body(self):
        return "  </main>\n  <footer>\n    <p>Generado automáticamente desde circuitoEsquema.xml</p>\n  </footer>\n</body>\n</html>\n"

    def section(self, title, inner):
        return f"    <section>\n      <h2>{title}</h2>\n{inner}    </section>\n"

    def ul(self, items):
        out = ["      <ul>"]
        for item in items:
            out.append(f"        <li>{item}</li>")
        out.append("      </ul>")
        return "\n".join(out) + "\n"

    def add(self, html_fragment):
        self.parts.append(html_fragment)

    def to_string(self):
        return self.head() + self.open_body() + "".join(self.parts) + self.close_body()

def text_of(el):
    return (el.text or "").strip() if el is not None else ""

def serialize_attributes(el):
    if not el.attrib:
        return ""
    return ", ".join(f'{k}={v}' for k, v in el.attrib.items())

def read_dom(path):
    return ET.parse(path).getroot()

def build_info_sections(root):
    html = Html()

    # Datos generales del circuito
    items = []
    for el in root.findall("./*", NS):
        lname = el.tag.split("}", 1)[-1]
        if lname in ("origen", "tramos"):
            continue
        # Especial: multimedia, resultados, referencias
        if lname == "multimedia":
            fotos = root.findall(".//u:fotos/u:foto", NS)
            if fotos:
                foto_items = []
                for f in fotos:
                    src = f.attrib.get("src")
                    desc = f.attrib.get("descripcion", "")
                    foto_items.append(f'<img src="{src}" alt="{desc}" />')
                html.add(html.section("Fotos", html.ul(foto_items)))
            videos = root.findall(".//u:videos/u:video", NS)
            if videos:
                video_items = []
                for v in videos:
                    src = v.attrib.get("src")
                    desc = v.attrib.get("descripcion", "")
                    video_items.append(f'<video src="{src}" controls>{desc}</video>')
                html.add(html.section("Videos", html.ul(video_items)))
            continue
        elif lname == "resultados":
            vencedor = root.find(".//u:vencedor", NS)
            if vencedor is not None:
                v_items = [f"{c.tag.split('}',1)[-1].capitalize()}: {text_of(c)}" for c in vencedor]
                html.add(html.section("Vencedor", html.ul(v_items)))
            podium = root.findall(".//u:podium/u:puesto", NS)
            if podium:
                podium_items = []
                for p in podium:
                    piloto = p.find("u:piloto", NS)
                    podium_items.append(f"Posición {p.attrib.get('posicion')}, País {p.attrib.get('pais')}, Puntos {p.attrib.get('puntos')}, Piloto {text_of(piloto)}")
                html.add(html.section("Podium", html.ul(podium_items)))
            continue
        elif lname == "referencias":
            ref_items = []
            for r in root.findall(".//u:referencia", NS):
                sitio = r.attrib.get("sitio", "")
                ref_items.append(f'<a href="{text_of(r)}">{sitio}</a>')
            html.add(html.section("Referencias", html.ul(ref_items)))
            continue

        val = text_of(el)
        attrs = serialize_attributes(el)
        if attrs:
            val += f" ({attrs})"
        items.append(f"{lname.capitalize()}: {val}")

    if items:
        html.add(html.section("Datos generales del circuito", html.ul(items)))

    return html

def xml2html(xml_path: str, html_path: str):
    root = read_dom(xml_path)
    html = build_info_sections(root)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html.to_string())

if __name__ == "__main__":
    xml2html("circuitoEsquema.xml", "InfoCircuito.html")
    print("Generado InfoCircuito.html")
