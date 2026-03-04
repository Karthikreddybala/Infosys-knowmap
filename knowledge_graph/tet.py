def generateMatrix(A):
        a=[]
        for i in range(A):
            a.append([0]*A)
        l=0
        t=0
        r=A-1
        b=A-1
        c=1
        while l<=r and t<=b:
            for i in range(l,r+1):
                a[t][i]=c
                c+=1
            t+=1
            for i in range(t,b+1):
                a[i][r]=c
                c+=1
            r-=1
            for i in range(r,l-1,-1):
                a[b][i]=c
                c+=1
            b-=1
            for i in range(b,t-1,-1):
                a[i][l]=c
                c+=1
            l+=1
            
            
        return a
print(generateMatrix(3))