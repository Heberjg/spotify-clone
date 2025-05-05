import PrimeraImangen from "../assets/Primera-imagen.webp"
import SegundaImangen from "../assets/Segunda-imagen.webp"
import TerceraImangen from "../assets/Tercer-imagen.webp"
import CuartaImangen from "../assets/Cuarta-imagen.webp"
import QuintaImangen from "../assets/Quinta-imagen.webp"
import PrimerOptimizada from "../assets/ImgOptimizadas/Primera-imagen_1_11zon.webp"
import SegundaOptimizada from "../assets/ImgOptimizadas/Segunda-imagen_2_11zon.webp"
import TerceraOptimizada from "../assets/ImgOptimizadas/Tercer-imagen_3_11zon.webp"
import CuartaOptimizada from "../assets/ImgOptimizadas/Cuarta-imagen_5_11zon.webp"
import QuintaOptimizada from "../assets/ImgOptimizadas/Quinta-imagen_4_11zon.webp"

export const songs = [
  {Name: "Primera Cancion",
  Artist: "Primer Artist", 
  Image: PrimeraImangen,
  img: PrimerOptimizada,
  Audio: "/Primera-musica/Primer-audio.mp3", 
  type: "song",
  id: "1",
  }, 

  {Name: "Segunda Cancion",
  Artist: "Segundo Artist",
  Image: SegundaImangen,
  img: SegundaOptimizada,
  Audio: "/Segunda-musica/Segundo-audio.mp3",
  type: "song",
  id: "2",
  },

  {Name: "Tercera Cancion",
  Artist: "Tercer Artist",
  Image: TerceraImangen,
  img: TerceraOptimizada,
  Audio: "/Tercera-musica/Tercer-audio.mp3",
  type: "song",
  id: "3",
  },

  {Name: "Cuarta Cancion",
  Artist: "Cuarto Artist",
  Image:  CuartaImangen,
  img: CuartaOptimizada,
  Audio: "/Cuarta-musica/Cuarto-audio.mp3",
  type: "song",
  id: "4",
  },

  {Name: "Quinta Cancion",
  Artist: "Quinto Artist",
  Image: QuintaImangen,
  img: QuintaOptimizada,
  Audio: "/Quinta-musica/Quinto-audio.mp3",
  type: "song",
  id: "5",
  },
]
