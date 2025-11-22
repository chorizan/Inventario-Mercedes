import styled from "styled-components";
import Lottie from "lottie-react";

export function Lottieanimacion({ alto = 150, ancho = 150, animacion }) {
  return (
    <Container>
      <Lottie
        animationData={animacion}
        loop={true}
        autoplay={true}
        style={{ height: `${alto}px`, width: `${ancho}px` }}
      />
    </Container>
  );
}
const Container = styled.div``;
