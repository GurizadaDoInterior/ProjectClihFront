export type CropImage = {uri:string; width:number; height:number};
export function constrainPhoto(image: CropImage, size:number, zoom:number, x:number, y:number) {
 const scale = size / Math.min(image.width,image.height) * Math.max(1,Math.min(3,zoom));
 const width=image.width*scale, height=image.height*scale;
 return {scale,width,height,x:Math.max(-(width-size)/2,Math.min((width-size)/2,x)),y:Math.max(-(height-size)/2,Math.min((height-size)/2,y))};
}
export function photoCrop(image:CropImage,size:number,zoom:number,x:number,y:number) {
 const frame=constrainPhoto(image,size,zoom,x,y);
 const side=Math.min(image.width,image.height,Math.floor(size/frame.scale));
 return {originX:Math.max(0,Math.min(image.width-side,Math.round((frame.width-size)/2/frame.scale-frame.x/frame.scale))),originY:Math.max(0,Math.min(image.height-side,Math.round((frame.height-size)/2/frame.scale-frame.y/frame.scale))),width:side,height:side};
}
