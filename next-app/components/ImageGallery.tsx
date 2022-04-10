import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import arrowLeft from '../static/arrow_left.png';

export const createWrapperAndAppendToBody = (wrapperId) => {
    const wrapperElement = document.createElement('div');
    wrapperElement.setAttribute('style', `
        position: absolute;
        top: 0;
        width: 99vw;
    `);
    wrapperElement.setAttribute("id", wrapperId);
    document.body.appendChild(wrapperElement);
    return wrapperElement;
}

export const ImageGallery = (props: ImageGalleryProps) => {
    const { images, disactive } = props;
    const [currentIndex, setCurrentIndex] = useState(0);
    const imgRef = useRef<HTMLDivElement>();
    const arrowLeftRef = useRef<HTMLImageElement>();
    const arrowRightRef = useRef<HTMLImageElement>();

    useLayoutEffect(() => {
        window.addEventListener('click', (e: MouseEvent) => {
            const targetElement = e.target as HTMLElement;
            if (imgRef.current && !imgRef.current.contains(targetElement) &&
                arrowLeftRef && arrowLeftRef.current.innerHTML !== targetElement.innerHTML &&
                arrowRightRef && arrowRightRef.current.innerHTML !== targetElement.innerHTML) {
                setCurrentIndex(-1);
                disactive();
            }
        });
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' && images.length) setNextImage();
            else if (e.key === 'ArrowLeft' && images.length) setPrevImage();
            else if (e.key === 'Escape') {
                setCurrentIndex(-1);
                disactive();
            }
        });
    }, []);

    const setPrevImage = () => {
        setCurrentIndex(currentIndex => (currentIndex <= 0) ? images.length - 1 : currentIndex - 1);
    };

    const setNextImage = () => {
        setCurrentIndex(currentIndex => (currentIndex >= images.length - 1) ? 0 : currentIndex + 1);
    };

    return <>
            {images && images.length ? images.map((image, i) => {
                if (i===currentIndex) return (
                    <div style={{backgroundColor: 'rgba(0, 0, 0, 0.7)', minHeight: '100vh'}}>
                        <img ref={arrowLeftRef} onClick={setPrevImage} src={arrowLeft.src} style={{position: 'fixed', width: '50px', filter: 'invert(100%)', top: '50%', left: '1%', cursor: 'pointer'}}/>
                        <img ref={arrowRightRef} onClick={setNextImage} src={arrowLeft.src} style={{position: 'fixed', width: '50px', filter: 'invert(100%)', top: '50%', right: '1%', cursor: 'pointer', transform: 'scaleX(-1)'}}/>
                        <div ref={imgRef} style={{margin: '0 auto', display: 'table'}}>
                            <img
                                key={i}
                                src={image.src}
                            />
                            <br/>
                            <button style={{margin: '0 auto', display: 'table'}} onClick={() => image.onDelete()}>Delete</button>
                        </div>
                    </div>
                )
            }) : null}
        </>;
}

interface ImageGalleryProps {
    images: Image[];
    disactive: () => void;
}

interface Image {
    src: string;
    onDelete: () => void;
}