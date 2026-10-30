/** Clamp a scroll chapter to a valid catalogue index, including empty or resized layouts. */
export function experienceScrollIndex(top:number,height:number,viewport:number,count:number):number {
 if(count<=1||!Number.isFinite(top)||!Number.isFinite(height)||!Number.isFinite(viewport))return 0;
 return Math.max(0,Math.min(count-1,Math.floor(Math.max(0,-top)/Math.max(1,height-viewport)*count)));
}
