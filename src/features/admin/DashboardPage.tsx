                  />
                  
                  {!msg.readStatus && (
                    <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_#00f0ff] z-10" />
                  )}
                  
                  <div className="relative z-10 pointer-events-none">
                    <p className="text-lg text-white mb-8 leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-auto border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {msg.timestamp
                            ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true, locale: ar })
                            : "Just now"}
                        </span>
                      </div>
                      <span className="text-[10px] tracking-widest opacity-50">ONYXBOX</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
