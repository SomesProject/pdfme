import React, { useContext, useState, useEffect } from 'react';
import {
  Schema,
  Plugin,
  BasePdf,
} from '@pdfme/common';
import { SearchOutlined } from '@ant-design/icons';
import { theme, Button } from 'antd';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from "@dnd-kit/utilities";
import Renderer from '../Renderer';
import { PluginsRegistry } from '../../contexts';
import PluginIcon from "./PluginIcon";

export type MenuEntries = {
  [key: string]: {
    icon?: React.ReactNode; // Icon for the menu entry
    plugins: string[]; // Array of plugin names
  };
};

const Draggable = (props: { plugin: Plugin<any>, scale: number, basePdf: BasePdf, children: React.ReactNode }) => {
  const { scale, basePdf, plugin } = props;
  const { token } = theme.useToken();
  const defaultSchema = plugin.propPanel.defaultSchema as Schema;
  const draggable = useDraggable({ id: defaultSchema.type, data: defaultSchema });
  const { listeners, setNodeRef, attributes, transform, isDragging } = draggable;
  const style = { transform: CSS.Translate.toString(transform) }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {isDragging &&
        <div style={{ transform: `scale(${scale})` }}>
          <Renderer
            key={defaultSchema.type}
            schema={{ ...defaultSchema, id: defaultSchema.type }}
            basePdf={basePdf}
            value={defaultSchema.content || ''}
            onChangeHoveringSchemaId={() => { void 0 }}
            mode={'viewer'}
            outline={`1px solid ${token.colorPrimary}`}
            scale={scale}
          />
        </div>
      }
      <div style={{ visibility: isDragging ? 'hidden' : 'visible' }}>
        {props.children}
      </div>
    </div>
  );
}

const LeftSidebarV2 = ({ height, scale, basePdf, menuEntriesStr }: { height: number; scale: number; basePdf: BasePdf, menuEntriesStr: string }) => {
  const { token } = theme.useToken();
  const pluginsRegistry = useContext(PluginsRegistry);
  const [isDragging, setIsDragging] = useState(false);
  const [menuOption, setMenuOption] = useState("Visual");
  const menuEntries = JSON.parse(menuEntriesStr);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      style={{
        left: 0,
        right: 0,
        position: 'absolute',
        zIndex: 3,
        height,
        width: 250, // Adjusted to accommodate two columns
        background: token.colorBgLayout,
        display: 'flex',
        flexDirection: 'row', // Horizontal layout for two columns
        overflow: isDragging ? 'visible' : 'auto',
      }}
    >
      {/* Column 1: Menu Options */}
      <div
        style={{
          width: '50%', // First column takes half the width
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
          backgroundColor: '#f2f2f2',
        }}
      >
        {Object.entries(menuEntries).map(([option]) => (
            <Button
              key={option}
              onClick={() => setMenuOption(option)}
              style={{
              display: 'flex',
              alignItems: 'center',
              margin: '10px 0',
              color: menuOption === option ? '#fff' : '#333', // Change text color when selected
              background: menuOption === option ? token.colorPrimary : '#f2f2f2', // Change background color when selected
              borderRadius: '0px', // Squarish corners
              border: 'none', // Borderless
              cursor: 'pointer',
              height: '70px',
              width: '100%', // Adjust width to fit within the column
              textAlign: 'left', // Align text to the left,
              paddingBottom: '5px',
              }}
            >
              {menuEntries[option]?.icon && (
              <span
                dangerouslySetInnerHTML={{ __html: menuEntries[option].icon }}
              />
              )}
              {option}
            </Button>
        ))}
      </div>

      {/* Column 2: Plugin Icons */}
      <div
        style={{
          width: '50%', // Second column takes half the width
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
          padding: '10px',
        }}
      >
        {(
          <div>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Drag Components</h3>
            {Object.entries(pluginsRegistry).map(([label, plugin]) => {
              if (!plugin?.propPanel.defaultSchema || !menuEntries[menuOption]?.plugins?.includes(label)) return null;
              return (
                <Draggable
                  key={label}
                  scale={scale}
                  basePdf={basePdf}
                  plugin={plugin as Plugin<any>}
                >
                  <Button
                    onMouseDown={() => setIsDragging(true)}
                    style={{ width: '70%', height: 50, marginTop: '0.25rem', padding: '0.25rem' }}
                  >
                    <div style={{
                      display: 'flex',  
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column',
                      }}>
                      <PluginIcon plugin={plugin as Plugin<any>} label={label} />
                      <span style={{ fontSize: '0.8rem' }}>{label}</span>
                    </div>
                  </Button>
                </Draggable>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebarV2;
