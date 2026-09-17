import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Store, Check, Sparkles } from 'lucide-react';
import { useMerchant, MerchantId } from '../../context/MerchantContext';

export const MerchantSelector: React.FC = () => {
  const { merchantId, setMerchantId, availableMerchants, activeOption } = useMerchant();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: MerchantId) => {
    setMerchantId(id);
    setIsOpen(false);
  };

  return (
    <div className="merchant-selector-wrapper" ref={containerRef}>
      <button
        type="button"
        className="merchant-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="merchant-icon-badge">
          <Store size={15} />
        </div>
        <div className="merchant-info-text">
          <span className="merchant-title">{activeOption.name}</span>
          <span className="merchant-sub">{activeOption.location}</span>
        </div>
        <ChevronDown size={14} className={`chevron-icon ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="merchant-dropdown-menu" role="listbox">
          <div className="dropdown-header">
            <span className="dropdown-label">Select Demo Profile</span>
            <span className="dropdown-badge">
              <Sparkles size={10} />
              Synthetic Data
            </span>
          </div>

          <div className="merchant-options-list">
            {availableMerchants.map((opt) => {
              const isSelected = opt.id === merchantId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`merchant-option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.id)}
                >
                  <div className="option-details">
                    <div className="option-name-row">
                      <span className="option-name">{opt.name}</span>
                      <span className={`option-type-pill ${opt.id}`}>{opt.badge}</span>
                    </div>
                    <span className="option-tagline">{opt.tagline}</span>
                  </div>
                  {isSelected && <Check size={16} className="check-icon" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
