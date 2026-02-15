import * as React from 'react';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

type FourAgCarouselImage = {
  src: string;
  alt: string;
};

interface FourAgCarouselProps {
  images: FourAgCarouselImage[];
}

export default function FourAgCarousel({ images }: FourAgCarouselProps) {
  return (
    <Carousel opts={{ loop: true }} className="w-full">
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.src}>
            <figure
              aria-label={image.alt}
              className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-panel"
            >
              <img
                src={image.src}
                alt={image.alt}
                width={1600}
                height={900}
                loading="lazy"
                style={{ width: '100%', height: 'auto' }}
                className="h-[280px] w-full object-cover sm:h-[380px] lg:h-[460px]"
              />
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-3 hidden bg-background/95 sm:inline-flex" />
      <CarouselNext className="right-3 hidden bg-background/95 sm:inline-flex" />
    </Carousel>
  );
}
