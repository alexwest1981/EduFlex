import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ScreenshotSlider = ({ screenshots }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
    }, [screenshots.length]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
    };

    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(nextSlide, 5000);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    return (
        <div
            className="relative w-full max-w-6xl mx-auto px-4 py-12 group"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            {/* Slider Container */}
            <div className="relative aspect-video overflow-hidden rounded-3xl shadow-2xl border border-white/20 bg-gray-900/5">
                {screenshots.map((item, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${index === currentIndex
                                ? 'opacity-100 translate-x-0 scale-100'
                                : 'opacity-0 translate-x-8 scale-95'
                            }`}
                    >
                        <img
                            src={item.src}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Caption Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <h4 className="text-white text-xl font-bold mb-1">{item.title}</h4>
                            <p className="text-white/80 text-sm">{item.description}</p>
                        </div>
                    </div>
                ))}

                {/* Navigation Buttons */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 hover:scale-110 active:scale-95"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 hover:scale-110 active:scale-95"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Pagination / Dots */}
            <div className="flex justify-center gap-3 mt-8">
                {screenshots.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`transition-all duration-300 rounded-full h-2 ${index === currentIndex
                                ? 'bg-blue-600 w-8'
                                : 'bg-gray-300 w-2 hover:bg-gray-400'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ScreenshotSlider;
