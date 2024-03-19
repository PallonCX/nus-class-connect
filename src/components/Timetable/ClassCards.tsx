import React from 'react';
import { ClassData } from '@/types/ClassData';
import { Table, TableRow, TableCell } from '@mui/material';

interface ClassCardsProps {
  classes: ClassData[];
  startTime: number;
  rows: number;
  color: string[];
}

const ClassCards: React.FC<ClassCardsProps> = ({ classes, startTime, rows, color }) => {
  const classesByDay: Map<string, [ClassData, string][]> = new Map(['MON', 'TUE', 'WED', 'THU', 'FRI'].map(day => [day, []]));
  classes.forEach((c, idx) => {
    const dayClasses = classesByDay.get(c.day);
    if (dayClasses) {
      dayClasses.push([c, color[idx]]);
    } else {
      // If the dayClasses is undefined, initialize it with an empty array and push the class c into it
      classesByDay.set(c.day, [[c, color[idx]]]);
    }
  });

  // Function to determine text color based on background color brightness
  const getTextColor = (bgColor: string): string => {
    // Convert hex color to RGB
    const r = parseInt(bgColor.substring(1, 3), 16);
    const g = parseInt(bgColor.substring(3, 5), 16);
    const b = parseInt(bgColor.substring(5, 7), 16);

    // Calculate brightness using the YIQ formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Use black text for bright background, and white text for dark background
    return brightness > 125 ? '#000000B0' : '#ffffffB0';
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', height: '100%', width: '100%', flexDirection: 'column' }}>
      <div style={{ flexGrow: 1 }}></div>
      <div style={{ flexGrow: rows * 2, display: 'flex', flexBasis: '0%' }}>
        <Table style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <tbody style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <TableRow style={{ display: 'flex', flexGrow: 1, flexDirection: 'row' }}>
              {Array.from(classesByDay.values()).map((classes, i) => {
                // Turn into clusters of overlapping classes
                const clusters: [ClassData, string][][][] = [];
                let currCluster: [ClassData, string][][] = [];
                classes.sort((a, b) => +a[0].startTime - +b[0].startTime + +a[0].endTime - +b[0].endTime);

                classes.forEach(c => {
                  // No existing cluster exists, so create one
                  if (currCluster.length === 0) {
                    currCluster.push([c]);
                    return;
                  }
                  // An existing cluster exists, so figure out if this class is part of it.
                  const lastElems = currCluster.map(col => col[col.length - 1]);
                  // Case where all elements in existing cluster end before the start of the current class
                  // => make new cluster
                  if (lastElems.filter(lastInCol => +lastInCol[0].endTime > +c[0].startTime).length === 0) {
                    clusters.push(currCluster);
                    currCluster = [[c]];
                    return;
                  }
                  // Case where not all existing classes in the cluster end before the start of the current class
                  // (Specifically when an earlier column is free)
                  // => Join cluster
                  for (let k = 0; k < lastElems.length; k++) {
                    if (+lastElems[k][0].endTime <= +c[0].startTime) {
                      currCluster[k].push(c);
                      return;
                    }
                  }
                  // No columns in current cluster are free => create new cluster column.
                  currCluster.push([c]);
                });
                // In case there was leftover
                if (currCluster.length > 0) {
                  clusters.push(currCluster);
                }

                let lastEnd = 0;

                return (
                  <TableCell
                    key={i}
                    style={{
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '0px',
                      flexBasis: '0%',
                      overflow: 'scroll',
                    }}
                  >
                    {clusters.map((cluster, j) => {
                      const clusterStart = +cluster[0][0][0].startTime / 100;
                      const clusterEnd = Math.min(...cluster.map(col => +col[col.length - 1][0].endTime / 100));

                      const absoluteStart = clusterStart - startTime;
                      const paddingAbove = absoluteStart - lastEnd;
                      lastEnd = clusterEnd - startTime;

                      return (
                        <React.Fragment key={j}>
                          <div style={{ flexGrow: paddingAbove, flexBasis: '0%' }}></div>
                          <div style={{ flexGrow: clusterEnd - clusterStart, display: 'flex', flexDirection: 'row', flexBasis: '0%' }}>
                            {cluster.map((col, k) => {
                              let lastClassEnd = 0;
                              return (
                                <div
                                  key={k}
                                  style={{
                                    flexGrow: 1,
                                    flexBasis: '0%',
                                    borderRadius: '5px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                  }}
                                >
                                  {col.map((c, p) => {
                                    const classStart = +c[0].startTime / 100;
                                    const paddingAbove = classStart - clusterStart;
                                    const classEnd = +c[0].endTime / 100;
                                    lastClassEnd = classEnd - clusterStart;
                                    return (
                                      <React.Fragment key={p}>
                                        <div style={{ flexGrow: paddingAbove, flexBasis: '0%' }}></div>
                                        <div
                                          style={{
                                            flexGrow: classEnd - classStart,
                                            backgroundColor: c[1],
                                            color: getTextColor(c[1]),
                                            borderRadius: '4px',
                                            margin: '4px',
                                            padding: '4px',
                                          }}
                                        >
                                          <strong>{c[0].courseName.split(' ')[0]}</strong>
                                          <br />
                                          {c[0].lessonType} [{c[0].classNo}]<br />
                                          {c[0].venue}
                                        </div>
                                      </React.Fragment>
                                    );
                                  })}
                                  <div style={{ flexBasis: '0%', flexGrow: clusterEnd - clusterStart - lastClassEnd }}></div>
                                </div>
                              );
                            })}
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div style={{ flexGrow: rows - lastEnd, flexBasis: '0%' }}></div>
                  </TableCell>
                );
              })}
            </TableRow>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ClassCards;
