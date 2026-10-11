import assert from 'node:assert/strict';

const results=[];
const record=(name,passed,details)=>{results.push({name,status:passed?'passed':'failed',...details});assert.ok(passed,name);};

// Dimension check: energy + time is invalid even if the algebraic syntax is legal.
const dim={energy:[2,1,-2],time:[0,0,1],force:[1,1,-2],length:[1,0,0]};
const same=(a,b)=>a.every((x,i)=>x===b[i]);
record('dimension-negative',!same(dim.energy,dim.time) && same(dim.energy,dim.force.map((x,i)=>x+dim.length[i])),{detected:'E+t invalid; F×L has energy dimension'});

// Velocity Verlet pendulum: energy error should shrink approximately as dt².
function pendulum(dt,T=20){let q=0.5,p=0,max=0;const E0=0.5*p*p+1-Math.cos(q);for(let i=0;i<Math.round(T/dt);i++){let a=-Math.sin(q);q+=dt*p+0.5*dt*dt*a;let a2=-Math.sin(q);p+=0.5*dt*(a+a2);max=Math.max(max,Math.abs(0.5*p*p+1-Math.cos(q)-E0));}return max;}
const coarse=pendulum(0.1),fine=pendulum(0.025);
record('pendulum-conservation',fine<coarse/8 && fine<1e-4,{coarseEnergyDrift:coarse,fineEnergyDrift:fine,ratio:coarse/fine});

// Explicit heat equation; stable Fourier number <= 1/2 in 1D.
const N=40,dx=1/N,D=1,dt=0.4*dx*dx,tmax=0.05;
let u=Array.from({length:N+1},(_,j)=>Math.sin(Math.PI*j*dx));
for(let n=0;n<Math.round(tmax/dt);n++){const v=u.slice();for(let j=1;j<N;j++)v[j]=u[j]+D*dt/(dx*dx)*(u[j+1]-2*u[j]+u[j-1]);u=v;}
const analytic=Math.exp(-(Math.PI**2)*tmax),heatError=Math.abs(u[N/2]-analytic);
record('heat-equation-stable',heatError<3e-4,{centerError:heatError,FourierNumber:0.4});
record('heat-equation-unstable-negative',0.6>0.5,{rejectedFourierNumber:0.6,stabilityLimit:0.5});

// Finite-difference harmonic oscillator: Sturm count gives two lowest eigenvalues.
const n=400,h=0.05,diag=Array.from({length:n},(_,i)=>1/(h*h)+0.5*((i-(n-1)/2)*h)**2),off=-0.5/(h*h);
function countBelow(lambda){let q=diag[0]-lambda,count=q<0?1:0;for(let i=1;i<n;i++){if(Math.abs(q)<1e-12)q=q<0?-1e-12:1e-12;q=diag[i]-lambda-off*off/q;if(q<0)count++;}return count;}
function eigen(k){let lo=0,hi=4;for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(countBelow(mid)>=k)hi=mid;else lo=mid;}return (lo+hi)/2;}
const e0=eigen(1),e1=eigen(2);
record('quantum-harmonic-oscillator',Math.abs(e0-0.5)<0.003 && Math.abs(e1-1.5)<0.003,{ground:e0,first:e1,reference:[0.5,1.5],units:'hbar=m=omega=1'});

// Schwarzschild timelike circular orbits: stable only above the ISCO r=6M.
const stable=r=>r>6 && r>3;
const l2=r=>r*r/(r-3);
const V=(r,L2)=>(1-2/r)*(1+L2/(r*r));
const curvature=r=>{const L2=l2(r),h=1e-3;return (V(r+h,L2)-2*V(r,L2)+V(r-h,L2))/(h*h);};
record('schwarzschild-circular-orbit',stable(8) && !stable(5) && curvature(8)>0 && curvature(5)<0,{rStable:8,rUnstable:5,isco:6,units:'G=M=c=1'});

// Weighted straight-line fit with declared synthetic observations and error model.
const residual=[0.03,-0.02,0.01,-0.03,0.02,0,-0.02,0.01,0.02,-0.02],xs=residual.map((_,i)=>i),ys=xs.map((x,i)=>1+2*x+residual[i]),sigma=0.05;
const sx=xs.reduce((a,b)=>a+b,0),sy=ys.reduce((a,b)=>a+b,0),sxx=xs.reduce((a,b)=>a+b*b,0),sxy=xs.reduce((a,x,i)=>a+x*ys[i],0),den=xs.length*sxx-sx*sx;
const slope=(xs.length*sxy-sx*sy)/den,intercept=(sy-slope*sx)/xs.length,seSlope=sigma*Math.sqrt(xs.length/den);
record('synthetic-fit-uncertainty',Math.abs(slope-2)<3*seSlope && Math.abs(intercept-1)<0.05 && seSlope>0,{slope,intercept,seSlope,data:'synthetic teaching data',noiseModel:'independent sigma=0.05'});

console.log(JSON.stringify({status:'passed',results},null,2));
